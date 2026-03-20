# BUSINESS REQUIREMENTS DOCUMENT

# **StoryForge**

### *AI-Powered Creative Writing Platform*

**Version:** 1.0
**Date:** March 2026
**Author:** Shrey Dhiman
**Classification:** CONFIDENTIAL

---

## 1. Executive Summary

StoryForge is an AI-powered creative writing platform that transforms the daunting blank-page experience into a guided, collaborative journey. Unlike existing tools that either teach writing theory (MasterClass, Coursera) or provide writing software for experienced authors (Scrivener, Final Draft), StoryForge bridges the gap by combining structured guidance, AI co-writing, and progress tracking into a single seamless experience.

The platform targets a massive underserved market: the millions of people who say "I have a book idea" but never start because they don't know how. StoryForge meets them where they are — whether that's a complete beginner with just a spark of an idea, a hobbyist looking to level up, or an aspiring author ready to finish their manuscript.

**Core Value Proposition:** *"From idea to finished manuscript, guided every step of the way by AI that writes with you, not for you."*

---

## 2. Problem Statement

### 2.1 The Gap in the Market

Today's creative writing landscape is fragmented into three disconnected categories, and no single platform unifies them:

| Category | Examples | Limitation |
|----------|----------|------------|
| Learning Platforms | MasterClass, Coursera, Skillshare | Teach theory but don't help you actually write |
| Writing Software | Scrivener, Final Draft, Ulysses | Powerful tools but assume you already know the craft |
| AI Writing Tools | Sudowrite, NovelCrafter, ChatGPT | Can help but require you to know what to ask for |

### 2.2 The Beginner's Dilemma

A complete beginner faces a paradox: they need to learn structure to write, but they need to write to learn structure. Current solutions force them to bounce between learning platforms and writing tools, losing momentum at every transition. Most give up before finishing Chapter 1.

### 2.3 Key Pain Points

- No single platform guides a beginner from raw idea to finished manuscript
- Existing writing tools have steep learning curves and overwhelming interfaces
- AI writing assistants require sophisticated prompting skills to be useful
- Learning platforms provide theoretical knowledge without practical application
- Writers lose motivation without progress feedback and structured milestones

---

## 3. Target Audience

### 3.1 User Personas

| Persona | Description | Primary Need | Success Metric |
|---------|-------------|--------------|----------------|
| The Dreamer | Has a book idea but zero writing experience. Doesn't know what a "three-act structure" is. | Step-by-step guidance from idea to first draft | Completes a short story within 30 days |
| The Hobbyist | Writes casually (journals, fan fiction, blog posts) but wants to write something more substantial. | Structure, feedback, and tools to level up | Finishes first novel draft within 6 months |
| The Aspiring Author | Has attempted novels before but never finished. Understands basics but struggles with execution. | AI co-pilot for pacing, plot holes, consistency | Completes a publishable-quality manuscript |
| The Student | Taking creative writing classes. Needs a practice environment with feedback. | Writing exercises, real-time AI feedback, format templates | Improved grades and writing confidence |

### 3.2 Addressable Market

The global creative writing market is substantial. Over 80% of people surveyed express interest in writing a book, yet fewer than 5% ever start. NaNoWriMo (National Novel Writing Month) attracts 300,000+ participants annually, with a completion rate under 20%. Self-publishing on Amazon KDP grew 264% between 2018 and 2023. These numbers point to enormous latent demand for a tool that actually helps people finish.

---

## 4. Product Vision & Core Concept

### 4.1 The StoryForge Experience

StoryForge is built around a single guiding metaphor: the AI is your writing partner, not your ghostwriter. The platform guides users through a structured creative process while the AI provides real-time co-writing assistance, making the experience feel like collaborating with an experienced author who adapts to your skill level.

### 4.2 Core Experience Flow

The user journey follows a natural creative workflow across five phases:

| Phase | What Happens | AI Role |
|-------|-------------|---------|
| 1. Spark | User describes their idea in plain language ("I want to write a thriller about a detective in Mumbai") | Asks probing questions to flesh out the concept. Suggests genre conventions, themes, and unique angles. |
| 2. Blueprint | AI generates a story structure (three-act, hero's journey, etc.) with character profiles, world details, and a chapter-by-chapter outline. | Builds the skeleton collaboratively. User can accept, modify, or regenerate any element. |
| 3. Draft | User writes chapter by chapter in a focused editor. AI is available inline for suggestions, continuity checks, and co-writing. | Suggests dialogue, descriptions, transitions. Flags plot holes and inconsistencies in real time. |
| 4. Refine | AI-powered revision tools for pacing, tone, readability, and style consistency across the manuscript. | Acts as an editor: highlights weak passages, suggests rewrites, checks character voice consistency. |
| 5. Polish | Final formatting, export to standard formats (PDF, ePub, screenplay format), and optional sharing. | Auto-formats based on genre standards. Generates synopsis, query letter drafts, and book blurbs. |

### 4.3 Teaching Through Doing

StoryForge embeds writing education directly into the workflow. When the AI suggests a three-act structure, it briefly explains why stories work this way. When it flags a "telling not showing" passage, it demonstrates the difference with your own text. Users learn craft organically, not through lectures.

---

## 5. Supported Writing Formats

| Format | Structure Template | Specialized Features |
|--------|-------------------|---------------------|
| Novel / Fiction | Three-Act Structure, Hero's Journey, Save the Cat beat sheet, Snowflake Method | Chapter management, character relationship maps, timeline tracker, subplot weaving, world-building wiki |
| Screenplay / Script | Standard screenplay format (Courier 12pt), three-act with sequence breakdown | Auto-formatting (slug lines, action, dialogue, parentheticals), scene numbering, character dialogue stats |
| Short Story | Simplified arc: setup → conflict → resolution, or literary/experimental structures | Word count targets, flash fiction mode, anthology organization, theme exploration tools |

---

## 6. Feature Breakdown

### 6.1 AI Co-Writing Engine

The AI engine is the heart of StoryForge. It operates in several modes depending on what the user needs:

| Mode | Trigger | Behavior |
|------|---------|----------|
| Brainstorm | User starts a new project or hits a creative block | Conversational: asks questions, suggests ideas, builds on user input. Generates multiple options for the user to choose from. |
| Co-Write | User is actively writing a scene | Inline: suggests next sentences, offers dialogue options, completes descriptions. User accepts, rejects, or edits suggestions with a single keypress. |
| Critique | User finishes a chapter or section | Editorial: analyzes pacing, identifies plot holes, flags inconsistencies, highlights repetitive language, checks character voice. |
| Teach | Contextual: triggered when AI identifies a learning opportunity | Educational: brief, inline explanations of craft concepts using the user's own writing as examples. Non-intrusive tooltips. |
| Format | User moves to Polish phase | Technical: auto-formats to industry standards, generates supplementary materials (synopsis, query letters, loglines). |

### 6.2 Guided Story Builder (Wizard Mode)

For complete beginners, StoryForge offers a wizard-style guided flow that walks through story creation step by step:

- **Step 1 — Idea Capture:** "Tell me your story idea in one sentence." AI helps refine it into a compelling logline.
- **Step 2 — Character Workshop:** Interactive character builder. AI asks about motivations, flaws, desires, relationships. Generates character profile cards.
- **Step 3 — World Setup:** For fiction/screenplays — time period, setting, rules of the world, cultural context.
- **Step 4 — Plot Architecture:** AI presents the chosen structure (e.g., three-act) with each beat explained, then collaboratively fills in each beat with the user.
- **Step 5 — Scene Breakdown:** Outline transforms into a scene-by-scene plan with estimated word counts and key events per scene.
- **Step 6 — Writing Begins:** User starts drafting with the full blueprint visible in a sidebar. AI co-pilot is active.

### 6.3 Smart Editor

The writing editor is purpose-built for creative writing, not adapted from a general-purpose text editor:

- Distraction-free mode with a minimal interface that expands tools on demand
- Split-pane view: manuscript on left, outline/notes/AI chat on right
- Inline AI suggestions (ghost text) that can be accepted with Tab or dismissed with Esc
- Character tracker: highlights character names and flags if someone hasn't appeared in a while
- Continuity checker: detects contradictions (e.g., a character's eye color changing)
- Dialogue analyzer: checks if each character's speech patterns are distinct
- Word count tracker with session goals and daily/weekly targets
- Focus timer with optional Pomodoro integration

### 6.4 Progress & Gamification

Light gamification keeps writers motivated without making the experience feel trivial:

- Writing streaks: consecutive days of meeting word count goals
- Milestone badges: first 1,000 words, first chapter, first draft complete, etc.
- Progress dashboard: visual timeline showing project completion percentage
- Weekly writing reports: words written, consistency, AI usage patterns
- Chapter completion celebrations with stats (word count, time spent, AI assist ratio)

### 6.5 Project Management

- Multi-project support: work on multiple stories simultaneously
- Version history: automatic saves with the ability to revert to any previous version
- Story bible: centralized reference for characters, locations, timeline, and world rules
- Research notes: attach reference material, images, and links to specific chapters or scenes
- Export: PDF, DOCX, ePub, Fountain (screenplay), and plain Markdown

---

## 7. Core User Flows

### 7.1 New User Onboarding

1. User lands on StoryForge homepage → signs up (email or Google OAuth).
2. Onboarding questionnaire: "What do you want to write?" (Novel / Screenplay / Short Story), "Have you written before?" (Never / A little / Experienced), "Do you have an idea already?" (Yes / Sort of / No).
3. Based on answers, AI personalizes the starting experience — beginners get Wizard Mode, experienced writers can skip to a blank project with AI available on demand.
4. User enters the workspace and begins their first project.

### 7.2 Writing Session Flow

1. User opens their project → dashboard shows progress, next suggested action, and streak status.
2. User clicks "Continue Writing" → editor opens at the last cursor position.
3. AI sidebar shows the current scene's context (what should happen, which characters are present, key beats).
4. User writes freely. AI offers ghost-text suggestions and can be invoked with a keyboard shortcut or by typing a trigger phrase.
5. On finishing a scene or chapter, user can request AI critique or move to the next section.
6. Session ends → stats popup shows words written, time, and streak progress.

---

## 8. Technical Architecture

### 8.1 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React.js (pure, no framework) | Lightweight, full control over routing and bundling. No Next.js overhead. Vite recommended as build tool for fast HMR and lean production builds. |
| Rich Text Editor | TipTap (ProseMirror-based) or Slate.js | Extensible, collaborative-ready editors. TipTap preferred for plugin ecosystem (AI suggestions, inline ghost text, formatting). |
| Backend | Node.js + Express.js (pure) | Minimal, battle-tested HTTP framework. Full control over middleware, routing, and request handling. No opinionated abstractions. |
| Database | MySQL (primary) + Redis (caching/sessions) | MySQL for relational data (projects, users, chapters, versions). Redis for session management, AI response caching, and real-time state. |
| ORM | Sequelize or Knex.js + Objection.js | Sequelize for rapid development with migrations. Knex.js for more control over raw queries. Both support MySQL natively. |
| AI / LLM | Groq API (primary) + Ollama (self-hosted fallback) | Groq for blazing-fast inference (LLaMA 3, Mixtral) with free tier. Ollama for offline/self-hosted models (Mistral, LLaMA 3) with zero API cost and full data privacy. |
| File Storage | Local filesystem (Node.js fs module) | Zero cost. Manuscripts, exports, and versioned files stored in a structured directory tree on the local machine. Simple, no cloud dependency. |
| Auth | Passport.js + express-session (Redis-backed) | Lightweight auth with local strategy (email/password) and Google OAuth via Passport. Sessions stored in Redis for performance. |
| Hosting | Local machine + Cloudflare Tunnel (when ready) | Zero hosting cost. Run the full stack locally during development and early users. Cloudflare Tunnel exposes it to the internet without port forwarding or a static IP. |
| Real-time | Socket.io | Live AI suggestions streaming, auto-save sync, and future collaboration features. Works seamlessly with Express. |

### 8.2 Architecture Overview

The system follows a clean, monorepo-friendly architecture with Express.js at the core. No heavy frameworks — just well-organized modules:

- React frontend (Vite) communicates with Express backend via REST API and Socket.io for real-time features
- AI Service layer abstracts Groq API and Ollama behind a unified interface — swap between cloud and local models with a config flag
- Story Engine manages project state, outline structures, character databases, and continuity checks
- Editor Service handles real-time document sync via Socket.io, auto-save to local filesystem, and version history
- Export Service generates formatted outputs (PDF, ePub, Fountain) from the internal document model
- Gamification Service tracks streaks, milestones, and progress analytics
- File Manager wraps Node.js fs with a structured directory convention: `/storage/users/{id}/projects/{id}/chapters/`, `/exports/`, `/versions/`

### 8.3 AI Integration Architecture

The AI layer supports two providers with automatic fallback:

- **Groq API (Primary):** Free tier with rate limits. Models include LLaMA 3 70B and Mixtral 8x7B. Extremely fast inference (~500 tokens/sec). Best for real-time inline suggestions and co-writing.
- **Ollama (Self-Hosted Fallback):** Run models locally (Mistral 7B, LLaMA 3 8B) for zero-cost, fully offline operation. Slower but unlimited and private. Ideal for critique mode and brainstorming where latency is acceptable.
- **Unified Interface:** An AI service class that accepts a provider config and routes requests to Groq or Ollama. If Groq rate-limits or fails, it automatically falls back to Ollama.
- **Streaming:** Both providers support streaming responses via Socket.io to the frontend for real-time ghost-text suggestions.

### 8.4 AI Prompt Architecture

The AI layer uses a multi-prompt strategy to deliver contextually relevant assistance:

- **System Prompt:** Defines the AI's role (writing partner), the project's genre, tone, and style preferences
- **Context Window:** Includes the current chapter, relevant character profiles, outline beats, and recent plot points
- **Mode-Specific Prompts:** Different prompt templates for brainstorming, co-writing, critiquing, and teaching
- **Memory Layer:** Summarized project context that persists across sessions (character arcs, resolved plot threads, style decisions)
- **Guardrails:** Prevents the AI from taking over the narrative voice, maintains the user's creative ownership

---

## 9. Database Schema (Core Entities)

| Entity | Key Fields | Relationships |
|--------|-----------|---------------|
| User | id, email, name, skill_level, onboarding_complete, streak_count, total_words | Has many Projects, has many Achievements |
| Project | id, user_id, title, format (novel/screenplay/short_story), genre, status, ai_style_prefs, created_at | Belongs to User, has many Chapters, has one StoryBible |
| StoryBible | id, project_id, premise, themes, setting, timeline_json, world_rules | Belongs to Project, has many Characters |
| Character | id, story_bible_id, name, role, backstory, personality, arc, relationships_json | Belongs to StoryBible |
| Outline | id, project_id, structure_type, beats_json, act_breakdown | Belongs to Project, has many OutlineBeats |
| Chapter | id, project_id, title, order, content, word_count, status, ai_critique_json | Belongs to Project, has many Versions |
| Version | id, chapter_id, content, word_count, created_at | Belongs to Chapter |
| WritingSession | id, user_id, project_id, started_at, ended_at, words_written, ai_interactions | Belongs to User and Project |
| Achievement | id, user_id, type, milestone, unlocked_at | Belongs to User |

---

## 10. MVP Scope & Phased Roadmap

### 10.1 Phase 1 — MVP (Months 1–3)

The minimum viable product focuses on the core loop: idea → outline → draft, with AI assistance.

- User authentication (email + Google OAuth)
- New project wizard (idea capture → character builder → outline generator)
- Rich text editor with basic AI co-writing (inline suggestions, scene continuation)
- Novel format only (screenplays and short stories added in Phase 2)
- Basic progress tracking (word count, chapter completion, daily streak)
- Manual save + auto-save with basic version history
- Export to PDF and DOCX
- Responsive web app (React.js)

### 10.2 Phase 2 — Format Expansion (Months 4–6)

- Screenplay format with auto-formatting (slug lines, dialogue, action)
- Short story format with word count constraints and flash fiction mode
- AI critique mode (chapter-level feedback on pacing, consistency, character voice)
- Story bible with character relationship maps
- Achievement system and milestone badges
- Export to ePub and Fountain format

### 10.3 Phase 3 — Advanced AI & Community (Months 7–12)

- AI teaching mode (contextual craft lessons embedded in the writing flow)
- Continuity checker and dialogue analyzer
- Community features: share projects, beta reader matching, writing groups
- Writing prompts and daily challenges
- Advanced analytics: writing patterns, productivity insights, AI dependency tracking
- Mobile-responsive optimizations

### 10.4 Future Scope

- Real-time collaboration (co-authoring)
- Publishing pipeline integration (Amazon KDP, IngramSpark)
- Audio narration generation (text-to-speech for manuscript preview)
- Illustration generation for book covers and scene visuals
- Localization (support for writing in Hindi, Spanish, and other languages)
- Monetization: Freemium model with Pro tier for advanced AI features, unlimited projects, and priority generation

---

## 11. Competitive Landscape

| Competitor | Strengths | Weakness vs StoryForge |
|-----------|-----------|----------------------|
| Sudowrite | Strong AI writing assistance, good UI | No guided flow for beginners. Assumes writing knowledge. Subscription-only ($19+/mo). |
| NovelCrafter | AI + outlining tools, character management | Power-user focused. Steep learning curve. No teaching component. |
| Scrivener | Industry standard for organization, one-time purchase | No AI at all. Overwhelming interface for beginners. Desktop-only. |
| Final Draft | Industry standard for screenplays | Extremely expensive ($250). No AI. Screenplays only. |
| Dabble | Clean UI, plot grid, goal tracking | AI is basic. No guided onboarding for beginners. |
| ChatGPT / Claude (direct) | Powerful AI, flexible | No writing-specific UI. Requires prompt engineering skill. No project management. |

**StoryForge's Differentiator:** The only platform that combines guided onboarding, AI co-writing, structured story building, and progress gamification into a single, beginner-friendly experience. We don't just give you tools — we walk you through the entire creative process.

---

## 12. Success Metrics & KPIs

| Metric | Target (6 months post-launch) | Why It Matters |
|--------|------------------------------|----------------|
| User Signups | 10,000+ | Validates market demand and top-of-funnel growth |
| Activation Rate | >60% complete first project wizard | Measures onboarding effectiveness |
| First Draft Completion | >15% of users finish a first draft | Core success metric — this is the problem we're solving |
| Weekly Active Writers | >25% of registered users | Measures engagement and habit formation |
| Average Streak Length | >5 consecutive days | Validates gamification effectiveness |
| AI Interaction Rate | >80% of writing sessions use AI features | Confirms AI co-pilot value proposition |
| NPS Score | >50 | Overall user satisfaction and word-of-mouth potential |

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI quality inconsistency | High — poor suggestions erode trust | Use structured prompts with genre-specific tuning. Groq (LLaMA 3 70B) for quality-critical tasks, Ollama (smaller models) for simpler suggestions. Allow users to rate suggestions. |
| Groq rate limits on free tier | Medium — could throttle AI features for active users | Implement smart caching in Redis. Fall back to Ollama when Groq limits are hit. Queue non-urgent AI tasks (critique, analysis) for off-peak processing. |
| Ollama performance on modest hardware | Medium — slow inference on CPU-only machines | Default to Groq for real-time features. Use Ollama only for background tasks unless user has a GPU. Provide model size recommendations in docs. |
| User writes nothing, AI writes everything | Medium — defeats the purpose | AI suggestion ratio tracking. Gentle nudges when AI dependence exceeds thresholds. "AI Assist Ratio" visible to user. |
| Local file storage data loss | High — losing someone's novel is unforgivable | Aggressive auto-save (every 30 seconds), version history in /versions/ directory, optional export-to-cloud backup (Google Drive). Encourage users to run on machines with redundant storage. |
| Scaling beyond local hosting | Low (for now) — becomes relevant with growth | Architecture is deployment-agnostic. When ready, containerize with Docker, move MySQL to managed DB, move files to S3, deploy to any VPS. Cloudflare Tunnel handles the transition period. |
| Content moderation | Medium — users may generate harmful content | Content guidelines, optional NSFW filter, and LLM-level content policy alignment. |

---

## 14. Product Naming

The working title "StoryForge" conveys the idea of crafting and building stories. Alternative names to consider:

- **Narratica** — evokes narrative + magic
- **DraftMate** — emphasizes the co-writing partnership
- **PlotPilot** — highlights AI guidance through story structure
- **InkWell AI** — classic writing imagery with modern AI
- **StoryForge** — crafting / building metaphor (recommended)

The final name should be checked for domain availability and trademark conflicts before launch.

---

## 15. Conclusion & Next Steps

StoryForge addresses a clear, large, and underserved market gap. The technology stack aligns perfectly with the developer's expertise (React.js, Node.js, Express.js, MySQL), and the AI integration leverages the rapidly maturing LLM ecosystem with a cost-effective dual-provider approach (Groq + Ollama). The phased roadmap ensures a focused MVP that can validate the core hypothesis — that guided AI co-writing dramatically increases the number of people who successfully complete creative writing projects.

### Immediate Next Steps

- Finalize product name and secure domain
- Initialize monorepo: `/client` (React + Vite), `/server` (Express.js), `/shared` (types/utils)
- Set up MySQL schema with migrations (Sequelize or Knex) and seed data
- Build the AI service layer with Groq SDK + Ollama REST client, unified interface with fallback logic
- Prototype the project wizard (Spark → Blueprint flow) with AI-powered question generation
- Integrate TipTap editor with custom extensions for inline AI ghost-text suggestions via Socket.io
- Implement local file storage manager with structured directory conventions
- Set up Passport.js auth (local + Google OAuth) with Redis-backed sessions
- Design the UI/UX (wireframes → high-fidelity mockups)
- Test locally, then expose via Cloudflare Tunnel for early user feedback

---

*— End of Document —*