# PortalKit

PortalKit is a Next.js client-operations workspace for freelancers and small studios. It combines project tracking, file delivery, approvals, invoices, notifications, and a client-facing portal in one product surface.

## Product surfaces

- Public marketing and auth flows
- Freelancer dashboard with project index and workspace shell
- Project detail workspace for milestones, files, approvals, and invoices
- Client portal for secure review, download, and invoice access
- Settings for notifications, profile, theme, and billing visibility

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS v4
- NextAuth
- MongoDB + Mongoose
- Resend
- Cloudflare R2 compatible object storage
- Upstash Redis rate limiting

## Local setup

1. Install dependencies.
   ```bash
   npm install
   ```
2. Create a local environment file.
   ```bash
   cp .env.example .env.local
   ```
3. Fill in the required environment variables in `.env.local`.
4. Start the dev server.
   ```bash
   npm run dev
   ```

Open `http://localhost:3000`.

## Environment variables

PortalKit expects the variables listed in [.env.example](/home/singason/Desktop/PortalKit/.env.example).

Required for core app startup:

- `MONGODB_URI`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`

Required for storage and uploads:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

Optional integrations:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `RESEND_API_KEY`
- `FROM_EMAIL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `CRON_SECRET`

## Scripts

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm test
npm run build
```

## What changed in this upgrade

- Added shared typed contracts and serializer boundaries across app and API layers.
- Normalized project, milestone, invoice, theme, and notification enums.
- Fixed portal/server-client separation and repaired broken project, file, approval, invoice, and settings flows.
- Added a real projects index plus real profile and billing settings pages.
- Reworked the global visual system with local fonts, semantic design tokens, motion, and themed toasts.
- Added contract and portal-session tests using Node's built-in test runner.

## Verification checklist

- Signup and login
- Dashboard load and project creation
- Project detail load and project editing
- File upload, preview, download, and versioning
- Approval request and response
- Invoice draft, send, view, and mark-paid flow
- Settings and theme persistence
- Portal view across desktop and mobile
