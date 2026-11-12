// "Continue with Primers ID" in the browser: PKCE (S256) + state for one round trip. Primers ID
// returns a one-time code to /auth/primers; the V-CTRIP server swaps it (with the verifier) for
// the person's verified email.
const PRIMERS_ID_URL = 'https://id.primersgroup.ng';
const CLIENT_ID = 'vctrip';
const KEY = 'vctrip-primers-flow';

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const random = (n: number) => b64url(crypto.getRandomValues(new Uint8Array(n)));
export const primersRedirectUri = () => `${window.location.origin}/auth/primers`;

/** `create` opens Primers ID on "Create account". */
export async function startPrimersSignIn(create = false) {
    const verifier = random(32);
    const state = random(16);
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    // localStorage, so the round trip survives the email-confirmation tab when creating an account.
    localStorage.setItem(KEY, JSON.stringify({ verifier, state, at: Date.now() }));
    const u = new URL('/connect', PRIMERS_ID_URL);
    u.search = new URLSearchParams({
        client_id: CLIENT_ID, redirect_uri: primersRedirectUri(),
        code_challenge: b64url(new Uint8Array(digest)), code_challenge_method: 'S256', state,
        ...(create ? { prompt: 'create' } : {}),
    }).toString();
    window.location.assign(u.href);
}

/** Reads and clears the round trip. Throws a readable message if anything doesn't match. */
export function finishPrimersSignIn(): { code: string; verifier: string } {
    const params = new URLSearchParams(window.location.search);
    window.history.replaceState(null, '', window.location.pathname); // keep the code out of history
    let saved: { verifier: string; state: string; at: number } | null = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { /* ignore */ }
    localStorage.removeItem(KEY);
    if (params.get('error')) throw new Error('Sign-in was cancelled.');
    const code = params.get('code');
    if (!saved || !code || params.get('state') !== saved.state || Date.now() - saved.at > 30 * 60_000) {
        throw new Error('That sign-in expired. Please try again.');
    }
    return { code, verifier: saved.verifier };
}
