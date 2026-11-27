# Caregiver log signature links

The VN Flutter app creates a one-time, seven-day share token in its own Supabase project. The recipient opens `/care-log-sign/<token>` on the Care24 web host, reviews the snapshot, and submits a drawn signature. The web server proxies the public read/sign RPCs to the VN Supabase project; it never uses a `service_role` key.

Configure these server-side environment variables before enabling the feature:

- `CARE_VIETNAM_SUPABASE_URL`
- `CARE_VIETNAM_SUPABASE_ANON_KEY`
- `CARE_VIETNAM_DEV_SUPABASE_URL`
- `CARE_VIETNAM_DEV_SUPABASE_ANON_KEY`

The VN app's production build creates `env=prod` links; development builds create `env=dev` links. Keep the values out of source control, pull requests, email, and logs. Apply the matching migration to the corresponding VN Supabase project before issuing links. The signer route is intentionally exempt from the Care24 login gate; all other private routes remain behind authentication.
