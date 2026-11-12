import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '@prisma/client';

// "Continue with Primers ID": a one-time code from id.primersgroup.ng is swapped here for who the
// person is. The code is single use, expires in 2 minutes and only works with the PKCE verifier
// made in the person's browser. Primers ID shares a per-app account number, name and verified email.
const PRIMERS_TOKEN_URL = 'https://atgqjrmcvpctywklfigb.supabase.co/rest/v1/rpc/primers_id_token';
const PRIMERS_PUBLISHABLE_KEY = 'sb_publishable_Im6hG4bodTfH4PtQvyHp1g_PcOO_6-p'; // public; grants nothing on its own
const PRIMERS_CLIENT_ID = 'vctrip';
export const PRIMERS_REDIRECT_URIS = [
    'https://vctrip.primersgroup.ng/auth/primers',
    'https://vctrip-web-primers.vercel.app/auth/primers',
];

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private auditService: AuditService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user) {
            return null;
        }

        if (user.isLocked) {
            await this.auditService.log(user.id, 'LOGIN_LOCKED', 'Attempt to login to locked account');
            throw new ForbiddenException('Account is locked due to too many failed attempts.');
        }

        const isMatch = await bcrypt.compare(pass, user.passwordHash);

        if (isMatch) {
            // Reset failed attempts on success
            if (user.failedLoginAttempts > 0) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { failedLoginAttempts: 0 },
                });
            }
            const { passwordHash, ...result } = user;
            return result;
        } else {
            // Increment failed attempts
            const attempts = user.failedLoginAttempts + 1;
            const isLocked = attempts >= 5;

            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    failedLoginAttempts: attempts,
                    isLocked: isLocked
                },
            });

            if (isLocked) {
                await this.auditService.log(user.id, 'ACCOUNT_LOCKED', 'Account locked after 5 failed attempts');
            }

            return null;
        }
    }

    async login(user: any, ip: string, userAgent: string) {
        const payload = { username: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        await this.setCurrentRefreshToken(refreshToken, user.id);
        await this.auditService.log(user.id, 'LOGIN_SUCCESS', 'User logged in successfully', ip, userAgent);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        };
    }

    async loginWithPrimersId(code: string, verifier: string, redirectUri: string, ip: string, userAgent: string) {
        if (!PRIMERS_REDIRECT_URIS.includes(redirectUri)) {
            throw new BadRequestException('Unknown return address');
        }
        let res: Response;
        try {
            res = await fetch(PRIMERS_TOKEN_URL, {
                method: 'POST',
                headers: { 'content-type': 'application/json', apikey: PRIMERS_PUBLISHABLE_KEY },
                body: JSON.stringify({ p_client_id: PRIMERS_CLIENT_ID, p_redirect_uri: redirectUri, p_code: code, p_verifier: verifier }),
                signal: AbortSignal.timeout(8000),
            });
        } catch {
            throw new ServiceUnavailableException('Primers ID is not responding. Try again in a moment.');
        }
        if (res.status >= 500) {
            throw new ServiceUnavailableException('Primers ID is not responding. Try again in a moment.');
        }
        if (!res.ok) {
            throw new UnauthorizedException('That sign-in expired. Please try again.');
        }
        const who = (await res.json()) as { sub?: string; email?: string; email_verified?: boolean };
        if (!who?.sub || !who.email || who.email_verified !== true) {
            throw new UnauthorizedException('Confirm your email on Primers ID, then sign in again.');
        }
        const email = who.email.toLowerCase();

        let user = await this.prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
        if (user) {
            if (user.isLocked) {
                await this.auditService.log(user.id, 'LOGIN_LOCKED', 'Primers ID sign-in to a locked account', ip, userAgent);
                throw new ForbiddenException('Account is locked due to too many failed attempts.');
            }
            // Staff, security and admin accounts keep to their own password: access to case data
            // should not depend on a second account system.
            if (user.role !== UserRole.STUDENT) {
                await this.auditService.log(user.id, 'LOGIN_PRIMERS_REFUSED', 'Primers ID sign-in refused for a privileged role', ip, userAgent);
                throw new ForbiddenException('Staff accounts sign in with their V-CTRIP password.');
            }
        } else {
            // No password is set: an unguessable random one is stored so password sign-in cannot succeed.
            const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), await bcrypt.genSalt());
            user = await this.prisma.user.create({ data: { email, passwordHash, role: UserRole.STUDENT } });
            await this.auditService.log(user.id, 'USER_REGISTER', 'User registered with Primers ID', ip, userAgent);
        }
        const { passwordHash: _, ...safe } = user;
        return this.login(safe, ip, userAgent);
    }

    async setCurrentRefreshToken(refreshToken: string, userId: string) {
        const salt = await bcrypt.genSalt();
        const currentRefreshToken = await bcrypt.hash(refreshToken, salt);
        await this.prisma.user.update({
            where: { id: userId },
            data: { hashedRefreshToken: currentRefreshToken },
        });
    }

    async refresh(userId: string, refreshToken: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.hashedRefreshToken) {
            throw new ForbiddenException('Access Denied');
        }

        const refreshTokenMatches = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
        if (!refreshTokenMatches) {
            throw new ForbiddenException('Access Denied');
        }

        const payload = { username: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        await this.setCurrentRefreshToken(newRefreshToken, user.id);

        return {
            access_token: accessToken,
            refresh_token: newRefreshToken,
        };
    }

    async logout(userId: string) {
        await this.prisma.user.updateMany({
            where: {
                id: userId,
                hashedRefreshToken: { not: null },
            },
            data: { hashedRefreshToken: null },
        });
    }

    async register(email: string, pass: string, role: UserRole = UserRole.STUDENT) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new BadRequestException('User already exists');
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(pass, salt);

        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                role,
            },
        });

        await this.auditService.log(user.id, 'USER_REGISTER', 'User registered');
        const { passwordHash: _, ...result } = user;
        return result;
    }
}
