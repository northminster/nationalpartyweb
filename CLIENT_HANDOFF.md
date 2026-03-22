# Client handoff checklist

Use this list when **accepting** or **delivering** the website package.

## Before launch

- [ ] **Review all public copy** on `index.html` (names, statements, Discord link, footer line).
- [ ] **Replace default administrator credentials** before the site is public. In `auth.js`, change `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD`, or create a new admin via **Accounts & permissions** after first login and then adjust defaults in code if your workflow requires it.
- [ ] **Confirm the logo and banner** in `images/` are the final assets.
- [ ] **Set Open Graph image URL** if you use social sharing: in `index.html`, update `og:image` to your full site URL (e.g. `https://yourdomain.com/images/national-party-logo.png`). Some platforms require an absolute URL.
- [ ] **Deploy** using the steps in `SETUP.md` (static host or your own server, HTTPS on).

## What to expect from this build

- **Staff sign-in, announcements, events, and user list** use **browser storage** on each device. They are suitable for a small team and **demonstration**; they are **not** a substitute for a server database for production-grade security or multi-device sync.
- Staff pages (`login.html`, `admin.html`, etc.) are marked **noindex** to reduce accidental indexing by search engines. Adjust in each file’s `<meta name="robots">` if your policy differs.

## After launch

- [ ] Spot-check **mobile** and **desktop** (navigation, forms, announcements block when published).
- [ ] Keep **backups** of any hosting config and, once you add a server, of your database.

## Files your content team may touch

| Need | Location |
|------|-----------|
| Homepage wording, sections | `index.html` |
| Site styling | `styles.css` |
| Default staff credentials (only before go-live) | `auth.js` (see top of file) |

For **domain, SSL, and future APIs**, see **`SETUP.md`**.
