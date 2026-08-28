# Going live

What to buy, what to set, and what is still missing before real candidates use this.

## 1. What to buy

| Thing | Pick | Cost | Why |
|---|---|---|---|
| Hosting | Vercel Hobby, then Pro | ₹0, then ~$20/mo | The repo already has `vercel.json` and `api/index.js`. Zero config. |
| Database | Supabase free tier | ₹0 up to 500 MB | Postgres without running a server. The app talks to it over HTTPS, so serverless cold starts don't exhaust connections. |
| Domain | any registrar | ~₹900/yr | Printed posters encode this domain. Buy it before you print anything. |

You do **not** need AWS S3 yet. Nothing uploads files — résumés are typed in, not attached.

## 2. Wire it up

1. Create a Supabase project. Copy **Project URL** and the **service_role** key from
   Project settings → API.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Set these in Vercel → Settings → Environment Variables:
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   VITE_PUBLIC_URL=https://yourdomain.com
   ```
   The service-role key must never be added with a `VITE_` prefix — that would ship it
   to every browser.
4. Deploy, then open `/status`. **Storage** must read *Postgres (durable)*. If it says
   *Local file*, the env vars did not load and every queue will be erased at random.

## 3. Print posters last

`VITE_PUBLIC_URL` is baked into the GATE QR at build time. Set the domain, deploy,
*then* open a drive's **Waiting screen** tab and print the GATE poster. A poster
printed before the domain is set points nowhere.

## 4. Running a drive

- Recruiter laptop: `/app/hiring` → open the drive → **Live queue**.
- Hall TV: **Waiting screen** → *Open on the hall TV* → `/tv/<driveId>`. Press the
  speaker icon once to enable voice announcements (browsers require a click first) and
  the expand icon for fullscreen.
- Candidates: scan the GATE poster, then type the DESK code shown on the TV. The DESK
  code is derived from the clock and rotates every 45 seconds, so a photo of the poster
  forwarded on WhatsApp cannot check anyone in from outside the room.
- Every candidate gets a token URL (`/t/<drive>/<token>`). It survives closing the tab.
  Point this out at check-in — it is the answer to "how will I know when it's my turn".

## 5. Still missing before 5,000 real candidates

These are known gaps, roughly in order of how much they matter.

1. **Check-in is not atomic.** Every client sends the whole queue back on each change,
   so two people checking in at the same instant can overwrite each other. Fix: a
   `POST /api/queue/join` endpoint that validates the DESK code and appends one
   candidate server-side, plus `POST /api/queue/:id/state` for call/decide.
2. **`GET /api/snapshot` returns candidate PII.** Names, phone numbers and emails are
   readable by anyone who knows a drive ID. This must be fixed before real personal
   data goes in — it is also a DPDP Act problem, not just a technical one. Fix: return
   only token, state and position unless the request carries a staff session, and move
   duplicate detection server-side (the client currently needs phone numbers to do it).
3. **Polling.** Each client refetches the full snapshot every 2 seconds. At a few
   hundred phones this is the thing that falls over first. Fix: Server-Sent Events, or
   Supabase Realtime on the `app_state` table.
4. **No OTP delivery.** Verification codes are the fixed demo values in
   `src/lib/helpers.js` (`DEMO_OTP`). Real SMS needs MSG91 plus DLT template
   registration, which needs GST registration and takes 1–2 weeks — start it now if you
   want it, and demo without it if you don't.
5. **Session storage.** Sessions live in the same JSON document as everything else and
   expire after 12 hours. Fine for a demo, not for many concurrent recruiters.

## 6. Local development

```bash
cp .env.example .env      # optional; blank Supabase vars fall back to a local file
npm install
npm run dev               # API on :8787, web on :5173
```

`npm run dev` prints the web port it settled on. Only the client reads `VITE_*`, so
restart it after changing those.

`npm run build` runs `eslint . --quiet` first and fails on any error. Keep it that way:
`no-undef` and `react/jsx-no-undef` catch components and helpers that are used but never
imported, which otherwise build cleanly and crash only when that branch renders. Both
rules are needed — `no-undef` doesn't inspect JSX element names and `jsx-no-undef` only
inspects those.

If a code change doesn't show up in the dev server, its file watcher has gone stale in
this project. Restart with `rm -rf node_modules/.vite && npm run dev` rather than
trusting hot reload.
