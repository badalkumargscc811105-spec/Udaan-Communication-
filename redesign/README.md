# UDAAN Communication — Redesign Preview

This is a non-production UI preview on the `redesign-preview` branch. It does not replace the current app or change database/auth/payment settings.

## Pages
- `index.html` — premium blue glassmorphism homepage
- `services.html` — separate services page
- `gallery.html` — separate gallery page
- `application.html` — application entry page
- `login.html` — login UI preview only
- `tracking.html` — receipt tracking UI preview only

## Supabase connection status
- `supabase-client.js` connects this preview to the existing Supabase project using its public publishable key only.
- The homepage shows a backend connection indicator.
- `login.html` now attempts Supabase email/password authentication, Google OAuth (only if enabled in Supabase), and password-reset email.
- The current `public` schema currently exposes `site_settings`, `profiles`, `messages`, `notices`, and `reviews`; the tables reported zero rows at the time of connection work. No schema or table was changed.
- Username/User ID/mobile login is not enabled because no safe username-to-email mapping table/column was found in the current schema. Dashboard routing is not yet implemented.

## Important integration work still required
- Connect existing authentication without changing user IDs, roles, or sessions.
- Read and write existing database tables using the current schema.
- Load published services and gallery items from the database.
- Connect application submissions, secure document storage, receipt generation, and status tracking.
- Preserve existing Razorpay backend order creation, signature verification, webhook handling, and wallet ledger.
- Never expose secret keys in client-side code or commit them to Git.
- Test all existing routes, dashboards, and integrations before any production deployment.

The original logo file is referenced at `../udaan_logo_login.png` and is not modified.