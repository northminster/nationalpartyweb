# Deployment and production setup

See **`README.md`** for what is in the package and **`CLIENT_HANDOFF.md`** for the launch checklist.

This guide explains how to put **National Party Westbridge** on your own domain, serve it from a server, and what is involved if you move beyond the current **browser-only** demo (local accounts, announcements, and events).

## What you have today

The site is a **static front end**: HTML, CSS, and JavaScript. There is **no backend** in this repository.

- **Login and user accounts** (`auth.js`) store users and sessions in **localStorage / sessionStorage** in each visitor’s browser.
- **Events** (`events-editor.js`, `events-public.js`) and **announcements** (`announcements-editor.js`, `announcements-public.js`) use **localStorage** only.

That means:

- Data does **not** sync across devices or browsers unless you build a server and APIs.
- Anyone can open DevTools and inspect or tamper with stored data; treat it as a **demo**, not real security.

Deploying “as-is” is still useful: you get a public **marketing site** with optional **staff tools** that only work meaningfully on one machine/browser until you add a real backend.

---

## 1. Point your domain at a host

1. **Buy or use a domain** from a registrar (e.g. Namecheap, Cloudflare, Google Domains).
2. At the registrar (or DNS host), create records that point to where the site will be served:
   - **A record** — hostname (often `@` or `www`) → **IPv4** of your server or load balancer.
   - **AAAA** — same for **IPv6**, if your host provides it.
   - **CNAME** — e.g. `www` → your provider’s hostname (common for Netlify, Vercel, GitHub Pages).

Propagation can take from minutes to 48 hours. Use `dig yourdomain.com` or an online DNS checker to confirm.

---

## 2. Option A — Static hosting (fastest)

If you only need the files online and are fine with the current localStorage behaviour (or you will add APIs later):

**Typical steps**

1. Upload the project folder (or build output) so the **site root** contains `index.html`, `styles.css`, `images/`, and the JS files.
2. Ensure **default document** is `index.html` and paths are case-sensitive on Linux hosts.
3. Enable **HTTPS** (most managed hosts do this automatically).

**Examples**

- **Netlify / Vercel / Cloudflare Pages** — connect a Git repo or drag-and-drop the folder; attach your custom domain in the dashboard; they issue TLS certificates.
- **GitHub Pages** — push to a `docs/` folder or `gh-pages` branch; set custom domain under repository settings.

**Checklist**

- [ ] All assets load (open DevTools → Network, fix 404s).
- [ ] `login.html`, `admin.html`, etc. work under the same origin (no mixed `file://` links).

---

## 3. Option B — Your own server (VPS)

Use a small **VPS** (DigitalOcean, Linode, Hetzner, AWS Lightsail, etc.) running Linux.

### 3.1 Install a web server

**Nginx** example: serve the site from `/var/www/npw` (adjust paths).

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/npw;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

For this project, most URLs are real `.html` files, so a simple `root` + `try_files` is enough. If you later use a single-page app router, you would fall back to `index.html`.

### 3.2 HTTPS with Let’s Encrypt

Use **Certbot** (or Caddy, which obtains certificates automatically):

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Then add `listen 443 ssl` and certificate paths (Certbot usually patches Nginx for you).

### 3.3 Firewall

Allow **80** and **443** (and **22** for SSH, restricted to your IP if possible). Close everything else unless you run other services.

---

## 4. What “adding APIs” actually means for this project

To replace localStorage with something production-safe, you typically add a **backend** that:

| Feature | Today | Production direction |
|--------|--------|-------------------------|
| Users & passwords | Hashes in `localStorage` | Server-side user table; **bcrypt** / **Argon2**; never trust client-only hashes for security |
| Sessions | Tokens in storage | **HTTP-only, Secure cookies** or short-lived **JWT** + refresh; CSRF protection for cookie sessions |
| Announcements | JSON + HTML in `localStorage` | **Database** + **sanitized HTML** server-side; **DOMPurify** still useful on output |
| Events | JSON array in `localStorage` | **CRUD API** + database |
| Permissions | Checked in JS only | **Enforced on the server** for every write |

### 4.1 Example API shape (illustrative)

You might implement REST (or GraphQL) routes such as:

- `POST /api/auth/login` — body: email, password → sets session cookie or returns token.
- `POST /api/auth/logout`
- `GET /api/users` — admin only; list users.
- `POST /api/users` — create user (admin).
- `PATCH /api/users/:id` — permissions (admin).
- `GET /api/announcements/public` — published HTML + metadata for the homepage.
- `PUT /api/announcements/publish` — staff with publish permission.
- `GET /api/events` / `PUT /api/events` — public list + staff updates.

Exact paths and payloads are up to your stack; the important part is **authorization on the server** for every mutating request.

### 4.2 Stack options (high level)

- **Node.js** (Express, Fastify, Nest) + PostgreSQL or SQLite.
- **Python** (Django, FastAPI) + PostgreSQL.
- **Serverless** (AWS Lambda, Cloudflare Workers) + managed DB — good if traffic is low and you want no VPS to maintain.

After APIs exist, you would **replace** direct `localStorage` calls in `auth.js`, `events-*.js`, and `announcements-*.js` with `fetch()` to your backend, and handle **401/403** redirects to `login.html`.

---

## 5. Security checklist for a public deployment

- [ ] **HTTPS everywhere**; redirect HTTP → HTTPS.
- [ ] **Content-Security-Policy** and other security headers (start strict, relax if needed).
- [ ] Do not rely on **default admin** credentials in production; remove or rotate them in code once a real admin exists server-side.
- [ ] **Rate-limit** login and write APIs.
- [ ] **Backups** if you use a database.
- [ ] **Secrets** (DB URL, API keys) in environment variables, **never** committed to Git.

---

## 6. Quick reference — file map

| Area | Files |
|------|--------|
| Public site | `index.html`, `styles.css`, `nav.js`, `events-public.js`, `announcements-public.js` |
| Staff login | `login.html`, `auth.js` |
| Admin dashboard | `admin.html` |
| Announcements editor | `announcements.html`, `announcements-editor.js` |
| Events editor | `events.html`, `events-editor.js` |
| User management | `users.html` (uses `auth.js`) |

---

## 7. Getting help

If you tell a developer “I want this static site plus a small API for login, announcements, and events,” they can use this document as a **scope**: static hosting today, **same domain** for an API subdomain (`api.yourdomain.com`) or path prefix (`/api/`) behind a reverse proxy later.
