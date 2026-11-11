import type { IncomingMessage, ServerResponse } from 'http';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/setup';

// Vercel function: one Nest app per warm instance (creating it per request would reconnect the
// database and rebuild the module graph on every call).
let ready: Promise<(req: IncomingMessage, res: ServerResponse) => void> | null = null;

async function build() {
    const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
    configureApp(app);
    await app.init();
    return app.getHttpAdapter().getInstance();
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
    if (!ready) ready = build().catch((err) => { ready = null; throw err; });
    const instance = await ready;
    instance(req, res);
}
