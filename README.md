# GOFT Internship Management

GOFT is a Next.js application for coordinating vocational internship programmes. It supports four roles:

- **Administrators** provision accounts and oversee all placements.
- **Teachers** create students, register placements, and approve weekly/final outcomes.
- **Workplace partners** submit daily logs, weekly summaries, and mark workplace approval.
- **Students** view their placement details and track feedback.

## Features

- Daily log and weekly summary submissions from workplace partners.
- Teacher approvals for weekly progress and final internship outcomes.
- Evaluation workflow for both teachers and workplace contacts.
- Central dashboard showing placement metrics and quick actions based on role.
- Secure authentication with JWT, MongoDB (Mongoose), and server-side session management.

## Development

```bash
npm install
npm run dev
```

Environment variables:

```
MONGODB_URI=...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=30d
ADMIN_NAME=Default Admin
ADMIN_EMAIL=admin@example.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123
```

Seed the default admin account:

```bash
npm run seed:admin
```
