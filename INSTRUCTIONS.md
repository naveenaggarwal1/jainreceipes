# Jain Recipe Website Instructions

## Purpose
Create a website for Jain community members to discover, submit, and download recipes aligned with Jain dietary preferences.

## Core Requirements
1. Search recipes
2. Submit recipes
3. Download recipe content
4. User account creation and login
5. Jain-specific dietary metadata and categories

## Functional Features

### Public browsing
- Home page with recipe listings
- Search by recipe title, ingredients, category, Jain filters
- Filters for Jain preferences such as no onion/garlic, no root vegetables, fasting-friendly

### Recipe detail page
- Title, description, ingredients, preparation steps
- Jain dietary notes and category labels
- Download button for recipe content (PDF or text)
- Optional image support

### Recipe submission
- Authenticated form for users to submit recipes
- Input fields: title, description, ingredients, instructions, category, Jain tags, optional image
- Submitter attribution and timestamp
- Optional moderation workflow for admin approval before publishing

### User accounts
- Register account with username/email and password
- Login / logout
- Profile page listing user-submitted recipes
- Password security and session handling

## Technical Recommendations
- Frontend: React or Next.js for a clean modern experience
- Backend: Node.js + Express or Next.js API routes
- Database: SQLite for a prototype, PostgreSQL for production
- Authentication: email/password with sessions or JWT
- Download format: PDF generation or downloadable text file
- Recipe storage: structured fields and searchable tags

## Execution Plan

### Phase 1: Design & Setup
1. Define data model
   - Recipe: id, title, description, ingredients, steps, category, jainTags, authorId, createdAt, approved
   - User: id, name, email, hashedPassword, createdAt
2. Choose stack
   - Example: Next.js + SQLite / Prisma + NextAuth
3. Initialize project structure
   - Set up package.json
   - Add linting and formatting
   - Create page routes and API endpoints

### Phase 2: Core Implementation
1. Build authentication
   - Register, login, logout, protected routes
2. Implement recipe CRUD
   - Create recipe submission form
   - Fetch recipe list and recipe details
3. Add search and filtering
   - Search input, category filters, Jain dietary tag filters
4. Add recipe download
   - Button exports recipe as PDF or downloadable `.txt`

### Phase 3: Polish & Deployment
1. Add user profile page
   - Display user-submitted recipes
2. Add recipe moderation
   - Admin review page to approve recipes before listing
3. Add UI polish
   - Responsive design, form validation, accessible navigation
4. Test flows
   - Registration, login, search, submit, download
5. Prepare deployment
   - Host on Vercel, Netlify, or another platform

## Questions Before Implementation
- Preferred tech stack: React + Node, Next.js, Flask, or static site with serverless?
- Should the recipe download be PDF, plain text, or both?
- Do you want email verification/password reset now or later?
- Should there be admin moderation before recipes publish?
- Are images required or optional for recipe submissions?
