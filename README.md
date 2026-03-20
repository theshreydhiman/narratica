# Narratica

**AI-Powered Creative Writing Platform** — From idea to finished manuscript, guided every step of the way by AI that writes *with* you, not *for* you.

Narratica is a full-stack writing platform that combines a guided story builder, real-time AI co-writing, industry-standard editors, and gamification to help aspiring authors go from a blank page to a completed manuscript.

## Features

### Writing Formats
- **Novel** — Full-length fiction with chapter-based organization, 80K word target
- **Screenplay** — Industry-standard Courier 12pt editor with scene headings, dialogue, action, parentheticals, transitions, and Fountain export
- **Short Story** — Focused format with section-based organization, 10K word target, and AI tuned for economy of language

### AI Co-Writing Engine
- **Co-Write Mode** — Inline ghost-text suggestions via streaming AI, context-aware continuity
- **Critique Mode** — Full chapter analysis with 6 focus areas: Overall, Pacing, Dialogue, Show vs Tell, Character Consistency, Opening Hook
- **Brainstorm** — AI-powered story ideation during project creation
- **Character Generation** — AI suggests characters based on premise and genre
- **Outline Generation** — Multiple structure types (Three-Act, Hero's Journey, Save the Cat, Freytag's Pyramid, Kishōtenketsu, and more)

### Smart Editor
- **Prose Editor** — TipTap-based rich text editor with real-time ghost-text AI suggestions (Tab to accept, Esc to dismiss)
- **Screenplay Editor** — Custom TipTap extensions for 6 screenplay element types with auto-formatting and keyboard shortcuts
- **Auto-save** — Content saves automatically every 2 seconds
- **Version Snapshots** — Manual save creates versioned snapshots for rollback

### Progress & Gamification
- **20 Achievements** across 5 categories (word count, streaks, chapters, projects, special)
- **Writing Streaks** — Daily streak tracking with flame counter in header
- **Real-time Notifications** — Achievement toasts via Socket.io when milestones are unlocked
- **Session Tracking** — Words written, time spent, AI interactions per session
- **Dashboard Stats** — Projects, streak, total words, achievements at a glance

### Project Management
- **4-Step Project Wizard** — Idea → Genre & Title → Characters → Create
- **Story Bible** — Premise, setting, themes, characters
- **Outline with Beats** — Structured story architecture
- **Multi-project** — Manage multiple projects simultaneously

### Export
- **PDF** — Formatted manuscript with title page, chapter breaks, justified text
- **DOCX** — Word-compatible HTML document
- **Fountain** — Industry-standard screenplay plain-text format

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TailwindCSS, Zustand |
| Editor | TipTap (ProseMirror) |
| Backend | Node.js, Express.js, TypeScript |
| Database | MySQL (Sequelize ORM) |
| Cache/Sessions | Redis |
| AI | Groq API (LLaMA 3.3 70B) + Ollama fallback |
| Auth | Passport.js (email/password + Google OAuth) |
| Real-time | Socket.io |
| Export | PDFKit, Fountain |

## Project Structure

```
narratica/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/    # Layout, AchievementToast, SessionStatsModal, Screenplay
│       ├── extensions/    # TipTap extensions (GhostText)
│       ├── hooks/         # useWritingSession
│       ├── lib/           # api.ts, socket.ts
│       ├── pages/         # Login, Register, Dashboard, ProjectWizard, Project, Editor, Onboarding
│       └── stores/        # Zustand (authStore, projectStore)
├── server/          # Express.js backend
│   └── src/
│       ├── config/        # database, passport, redis
│       ├── middleware/     # auth
│       ├── models/        # User, Project, StoryBible, Character, Outline, Chapter, Version, WritingSession, Achievement
│       ├── routes/        # auth, projects, chapters, ai, users, export
│       ├── services/      # ai, gamification, export
│       └── socket/        # Real-time handlers
├── shared/          # Shared types and utilities
└── package.json     # Workspace root
```

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+
- Redis
- (Optional) Groq API key for AI features
- (Optional) Ollama for local AI fallback

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/theshreydhiman/narratica.git
   cd narratica
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your database, Redis, and API credentials
   ```

4. **Setup the database**
   ```bash
   mysql -u root -p < server/src/db.sql
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```
   This starts both the Express server (port 3001) and Vite dev server (port 5173) concurrently.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | MySQL connection | Yes |
| `REDIS_HOST`, `REDIS_PORT` | Redis connection | Yes |
| `SESSION_SECRET` | Express session secret | Yes |
| `GROQ_API_KEY` | Groq API key for AI features | No (falls back to Ollama) |
| `OLLAMA_BASE_URL` | Ollama server URL | No (defaults to localhost:11434) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth credentials | No |
| `CLIENT_URL` | Frontend URL for CORS | No (defaults to http://localhost:5173) |

## Database Schema

9 tables: `users`, `projects`, `story_bibles`, `characters`, `outlines`, `chapters`, `versions`, `writing_sessions`, `achievements`

See [server/src/db.sql](server/src/db.sql) for the full schema.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email/password |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/google` | Google OAuth |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/chapters/:id` | Get chapter |
| PUT | `/api/chapters/:id` | Save chapter (auto-calculates word count) |
| POST | `/api/ai/generate` | AI generation (co-write, brainstorm, etc.) |
| POST | `/api/ai/critique` | AI critique with focus area |
| POST | `/api/ai/brainstorm` | Story brainstorming |
| GET | `/api/users/profile` | User profile with stats & achievements |
| GET | `/api/export/:id/pdf` | Export as PDF |
| GET | `/api/export/:id/docx` | Export as DOCX |
| GET | `/api/export/:id/fountain` | Export as Fountain |

## Author

**Shrey Dhiman** — [theshreydhiman](https://github.com/theshreydhiman)

## License

This project is proprietary. All rights reserved.
