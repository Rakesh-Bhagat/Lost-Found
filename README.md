<div align="center">

# 🔎 Lost & Found

**A full-stack platform that reunites people with their lost belongings, using AI-powered text and image matching to connect lost reports with found items automatically.**

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

> 🧠 The matching engine lives in its own repository: **[L-F-ML-model](https://github.com/Rakesh-Bhagat/L-F-ML-model)** (text + image matching services).

## 💡 The Problem

Campuses, offices and public spaces have the same broken process for lost property: a notice board, a WhatsApp group, or a desk that closes at 5 PM. Owners don't know where to look, and finders don't know who to give things to.

**Lost & Found** replaces that with one searchable place. You post what you lost or found, and the system does the matching for you: when a new post looks like an existing one on the opposite side, both people get an email.

## ✨ Features

- **🤖 Automatic AI matching.** Every new post is compared against all active items of the opposite type (lost vs. found) by two separate ML services (source: [L-F-ML-model](https://github.com/Rakesh-Bhagat/L-F-ML-model)):
  - **Text matching** on title and description
  - **Image matching** on the uploaded photos
- **📧 Instant match alerts.** Both the owner and the finder get an HTML email with the matched item's photo, location, date and a direct link.
- **💬 In-app messaging.** Private, item-linked message threads between two users, with read/unread tracking, so contact details stay private.
- **📸 Photo uploads** via Cloudinary, with a clean item detail page for each report.
- **🔐 Secure authentication.** Email and password sign-up with bcrypt-hashed passwords, JWT sessions and protected routes and API endpoints (NextAuth.js).
- **🗂️ Browse, search and filter** items by type (lost or found) and category (Electronics, Keys, ID Cards, Books, Clothing, Accessories and more).
- **📊 Personal dashboard** to manage your own reports and mark them as resolved.
- **🌗 Light and dark mode**, fully responsive down to mobile.

## 🏗️ Architecture

```
                        ┌─────────────────────────────┐
                        │  Next.js 15 (App Router)    │
   Browser  ──────────▶ │  React 19 UI + API Routes   │
                        └──────┬──────────┬───────────┘
                               │          │
              ┌────────────────┘          └───────────────┐
              ▼                                           ▼
   ┌────────────────────┐                     ┌───────────────────────┐
   │ PostgreSQL         │                     │ Cloudinary            │
   │ (Prisma ORM)       │                     │ image hosting         │
   │ Users, Items,      │                     └───────────────────────┘
   │ Threads, Messages  │
   └────────────────────┘
              ▲
              │  on every new item (POST /api/items)
              │
   1. Validate input with Zod
   2. Save item
   3. Fetch active items of the OPPOSITE type
   4. ├─▶ Text-match ML API   ─┐
      └─▶ Image-match ML API  ─┴─▶ match found? ─▶ Nodemailer emails both users
```

**Design decisions worth calling out**

| Decision | Why |
|---|---|
| ML matching runs as separate services behind HTTP APIs ([L-F-ML-model](https://github.com/Rakesh-Bhagat/L-F-ML-model)) | Keeps the Python/ML stack independent from the web app, so each can be deployed and scaled on its own. |
| Match against the *opposite* type only | A lost item can only be matched by a found item, which cuts the search space in half and removes false positives. |
| Zod validation on every API route | Untrusted input is rejected at the boundary with clear `400` errors. |
| Item-scoped message threads | Every conversation is tied to the item it's about, so both sides always have context. |
| JWT sessions and Prisma adapter | Stateless auth that still works with the relational user model. |

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling / UI | Tailwind CSS, shadcn/ui, Radix UI primitives, Lucide icons |
| Forms / validation | React Hook Form, Zod |
| Database | PostgreSQL with Prisma ORM |
| Auth | NextAuth.js (credentials provider), bcryptjs |
| Email | Nodemailer |
| Media | Cloudinary |
| AI / ML | Text and image matching services, maintained in [L-F-ML-model](https://github.com/Rakesh-Bhagat/L-F-ML-model) |

## 🗄️ Data Model

`User` ─┬─< `Item` ─< `MessageThread` ─< `Message`
       └─< `Account` / `Session` (NextAuth)

- **Item**: title, description, category, `lost | found`, location, date, image, `active | resolved`
- **MessageThread**: two participants plus the item they're discussing
- **Message**: content, sender, receiver, read flag

See [`prisma/schema.prisma`](prisma/schema.prisma) for the full schema.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18+
- A PostgreSQL database (local, Neon, Supabase and so on)
- A Gmail account with an [app password](https://support.google.com/accounts/answer/185833) for sending emails
- A Cloudinary account with an unsigned upload preset
- The text-match and image-match services from [L-F-ML-model](https://github.com/Rakesh-Bhagat/L-F-ML-model), deployed somewhere reachable (follow that repo's README to run them)

### Installation

```bash
# 1. Clone
git clone https://github.com/Rakesh-Bhagat/Lost-Found.git
cd Lost-Found

# 2. Install dependencies
npm install

# 3. Configure environment variables (see below)
cp .env.example .env   # or create .env manually

# 4. Set up the database
npx prisma migrate dev

# 5. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME"

# NextAuth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# App
SITE_URL="http://localhost:3000"

# Email (match notifications)
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASS="your-gmail-app-password"

# Image matching service (deploy from https://github.com/Rakesh-Bhagat/L-F-ML-model)
IMAGE_MATCH_API="https://your-image-match-service"

# Pusher (optional, configured in lib/pusher.ts)
PUSHER_APP_ID=""
NEXT_PUBLIC_PUSHER_KEY=""
PUSHER_SECRET=""
NEXT_PUBLIC_PUSHER_CLUSTER=""
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm start` | Run the production build |
| `npm run lint` | Lint the codebase |

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth + registration
│   │   ├── items/         # CRUD + AI match trigger
│   │   └── messages/      # Threads and messages
│   ├── auth/              # Sign in / sign up pages
│   ├── dashboard/         # User's own reports
│   ├── items/             # Browse, detail, create
│   └── messages/          # Inbox and conversations
├── components/            # App components + shadcn/ui
├── lib/                   # Email, Pusher, utilities
├── prisma/                # Schema and migrations
└── types/                 # Type augmentations
```

## 🛣️ Roadmap

- [ ] Similarity score and ranked "top N matches" instead of a single best match
- [ ] Real-time chat and notifications over WebSockets (Pusher client is already wired up)
- [ ] Map view and geo-radius matching
- [ ] Google / OAuth sign-in
- [ ] Admin moderation panel
- [ ] Automated tests and CI

## 👨‍💻 Author

**Rakesh Bhagat**

[GitHub](https://github.com/Rakesh-Bhagat) · [Web app (this repo)](https://github.com/Rakesh-Bhagat/Lost-Found) · [ML matching service](https://github.com/Rakesh-Bhagat/L-F-ML-model)

---

<div align="center">

If you found this project useful, consider giving it a ⭐

</div>
