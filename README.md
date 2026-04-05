# JainRasoi 🙏

**A community-driven Jain vegetarian recipe platform** — built to preserve and celebrate authentic Jain cooking with filters for Upvas, Paryushan, and no root vegetable diets.

🌐 **Live:** https://naveenaggarwal1.github.io/jainreceipes/

---

## A note from the builder

I'm a Technical Product Manager. I've spent years writing PRDs, running sprints, and working alongside engineers — understanding deeply *what* to build, but always depending on a dev to actually build it.

That changed with vibe coding.

This project started as a simple idea: a recipe website for Jain food, something my family could actually use. In the past, I would have scoped it, written tickets, and waited. Instead, I sat down with Claude Code and just... built it. In a single session.

Not by learning React or Supabase from scratch. But by describing what I wanted, reviewing the output, catching the trade-offs, and iterating fast. The product instincts I've built over years turned out to be exactly the right muscle for this — knowing *what* good looks like, even if I couldn't always write it myself.

What surprised me most: the bottleneck was never the code. It was clarity of thought. The more precisely I could describe the problem, the better the output. That's a PM skill, not an engineering one.

Vibe coding doesn't replace engineers. But it does collapse the distance between idea and product for people who think in systems and outcomes. I shipped a full-stack app with auth, a database, community features, and a CI/CD pipeline — and I understood every decision along the way.

This is just the beginning.

---

## What is JainRasoi?

A recipe community platform built specifically for Jain dietary principles:

- **Browse & search** recipes with Jain-specific filters
- **Dietary tags** — No Root Veg, Paryushan-friendly, Upvas/Fasting, No Onion/Garlic
- **Community** — register, submit recipes, rate and review
- **Bookmarks** — save your favourites
- **Admin panel** — moderate submissions, manage users

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router, static export) |
| Styling | Tailwind CSS |
| Backend / Auth | Supabase (Postgres + RLS + Auth) |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |

---

## Running locally

```bash
# 1. Clone the repo
git clone https://github.com/naveenaggarwal1/jainreceipes.git
cd jainreceipes

# 2. Install dependencies
npm install

# 3. Add your Supabase credentials
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Set up the database
# Run supabase/migrations/001_schema.sql in your Supabase SQL Editor

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database setup

Run `supabase/migrations/001_schema.sql` in the [Supabase SQL Editor](https://supabase.com/dashboard). This creates all tables, RLS policies, and seeds 8 default Jain recipes.

To make yourself an admin, update your profile row in Supabase:
```sql
update public.profiles set role = 'admin' where id = '<your-user-id>';
```

---

## Deploying to GitHub Pages

1. Fork the repo
2. Add two GitHub Actions secrets: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Go to Settings → Pages → Source → GitHub Actions
4. Push to `master` — the workflow handles the rest

---

---

## Credits & Inspiration

This project was inspired by **[@shravan-swagwalapm](https://github.com/shravan-swagwalapm)** — watching his class on vibe coding as a Product Manager is what gave me the push to finally stop spectating and start building. If you're a PM on the fence about trying this, go watch his video first.

---

*Built with [Claude Code](https://claude.ai/code) — Ahimsa in every bite* 🙏
