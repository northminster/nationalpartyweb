# National Party Westbridge — website package

A static website for **National Party Westbridge**: public pages, policy statements, events, and a **staff area** (dashboard, announcements editor, events editor, and account management).

## What is included

| Area | Purpose |
|------|---------|
| `index.html` | Public homepage |
| `login.html` | Staff sign-in |
| `admin.html` | Staff dashboard |
| `announcements.html` | Publish official announcements |
| `events.html` | Manage events shown on the homepage |
| `users.html` | Create accounts and set permissions (administrators) |
| `styles.css` | All styling |
| `images/` | Logo and banner assets |
| `auth.js` | Sign-in and permissions (browser storage in this build) |
| `SETUP.md` | **Domain, server, HTTPS, and future APIs** |
| `CLIENT_HANDOFF.md` | **Checklist for your team before and after launch** |

## Viewing locally

Open `index.html` in a browser, or serve the folder so all paths work the same as on the web:

```bash
cd national-party-westbridge
python3 -m http.server 8080
```

Then visit `http://localhost:8080/`.

## Next steps

1. Read **`CLIENT_HANDOFF.md`** for launch checklist and security notes.  
2. Read **`SETUP.md`** when you are ready to connect a **domain**, **hosting**, or a future **backend**.

## Support

Technical questions about deployment and APIs are covered in **`SETUP.md`**. Content updates (text, images, Discord link) are edited in the HTML files or through the staff dashboard where applicable.
