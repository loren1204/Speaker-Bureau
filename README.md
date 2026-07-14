# Lee Health Speakers Bureau

Next.js App Router application for the public speaker directory and authenticated outreach-team portal.

## Local development

```bash
npm install
npm run dev
```

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FORMSPREE_ENDPOINT=https://formspree.io/f/your-form-id
```

`SUPABASE_SERVICE_ROLE_KEY` and `FORMSPREE_ENDPOINT` are server-only. Never prefix the service key with `NEXT_PUBLIC_`.

## Supabase setup

Run [supabase/migrations/202607140001_portal_expansion.sql](supabase/migrations/202607140001_portal_expansion.sql) once in the Supabase SQL editor before deploying this version. The migration is non-destructive and:

- adds `updated_at` to speakers;
- extends the existing profiles and speaker request tables;
- creates `activity_log`;
- enables stakeholder-aware RLS policies;
- creates the public `speaker-photos` and `team-avatars` buckets with upload policies;
- adds request/activity tables to Supabase Realtime.

Existing team users still need a row in `public.profiles` with `role = 'stakeholder'`. Profile identity and role changes should be made by a trusted administrator, not from the browser.

## Request delivery

`POST /api/requests` validates the public form, stores the request in Supabase, then forwards it to Formspree. If Formspree fails after the database insert, the request remains visible in the portal with `formspree_delivery_status = 'failed'`, and the public UI receives an explicit partial-success message.

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run build
```
