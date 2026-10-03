# Administrator password login

The public site retains its existing audience. Hospital listings and sanitized boards remain public; submissions retain their existing authentication checks.

Administrator access now requires an app-owned password session. Trusted platform identity alone no longer grants inbox/edit access. It can only bootstrap the first account when no admin account exists. The owner enters their chosen credentials directly in the setup UI; credentials are never stored in source or browser local storage.

Credentials use a random 32-byte salt and WebCrypto PBKDF2-SHA512 with 100,000 iterations, compatible with the Worker runtime. The database stores only a verifier. Password minimum length is 12 characters. Login attempts are limited to eight per client address per 15 minutes. The client address is hashed before rate-limit storage. Login sessions use random 256-bit tokens; only SHA-256 token hashes are stored. Cookies use the __Host prefix, HttpOnly, Secure and SameSite=Strict, with eight-hour expiry. Logout revokes the server-side session. Authentication writes require a same-origin JSON POST.

Migration 0004 adds singleton admin credentials, expiring sessions and login-attempt storage. Existing patient records and migration history are unchanged. Account replacement/reset is not exposed publicly; no default password or recovery bypass exists.

Validation: tests/ward-board.mjs covers owner-only setup, setup races via a singleton/INSERT OR IGNORE, wrong-password response, rate limits, session expiry, logout revocation, rejected cross-origin login, private API access and denial of platform-only administrator bypass. No production credentials are created by tests.
