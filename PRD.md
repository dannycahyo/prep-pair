# PrepPair — Product Requirements Document

> **Meal Prep Made Easy for Couples**

| Field            | Value                                             |
| ---------------- | ------------------------------------------------- |
| **Product Name** | PrepPair                                          |
| **Version**      | 1.2                                               |
| **Author**       | Danny (Software Engineer / Product Owner)         |
| **Date**         | February 15, 2026                                 |
| **Status**       | Draft                                             |
| **Platform**     | Progressive Web App (PWA)                         |
| **Target Users** | Married couple (personal use, scalable to public) |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Feature Specification](#4-feature-specification)
5. [Core User Flow](#5-core-user-flow)
6. [Technical Architecture](#6-technical-architecture)
7. [Development Timeline](#7-development-timeline)
8. [Success Metrics](#8-success-metrics)
9. [Risks & Mitigations](#9-risks--mitigations)
10. [Future Considerations](#10-future-considerations)
11. [Appendix](#11-appendix)

---

## 1. Executive Summary

PrepPair is a lightweight Progressive Web App designed to eliminate the friction of weekly meal preparation for a married couple. It addresses three core pain points: decision fatigue when choosing meals, food waste from overbuying groceries, and the monotony of repetitive menus.

The app provides a weekly meal planner, budget tracking in IDR, a flexible recipe manager, and auto-generated grocery lists. It is designed as a **single-user personal tool** (shared by the couple on the same account) with a clean architecture that enables future scaling to AI-powered features and a multi-user public product.

---

## 2. Problem Statement

### 2.1 Current Pain Points

- **Decision Fatigue:** Every week, the couple faces the recurring question of what to cook for 21 meals (3 meals × 7 days). Without a structured system, this leads to decision paralysis and defaults to the same meals or takeout.
- **Food Waste & Overbuying:** Without a consolidated shopping list tied to actual meal plans, groceries are purchased based on impulse or rough estimates, leading to overbuying, spoilage, and wasted money.
- **Meal Repetition:** Limited recipe repertoire and lack of inspiration result in eating the same 5–10 meals on rotation, reducing satisfaction and nutritional variety.

### 2.2 Opportunity

Most meal planning apps are over-engineered for individuals or large families. PrepPair focuses on simplicity — a single shared workspace for a couple, protected by a PIN, with a fast and intuitive planning experience.

---

## 3. Target Users

The primary users are a married couple who share one PrepPair account. Either person can open the app and manage the weekly plan. There is no multi-user collaboration or role-based access in v1 — the app represents a single shared workspace.

| Attribute         | Detail                                                                            |
| ----------------- | --------------------------------------------------------------------------------- |
| **Who**           | A married couple living together                                                  |
| **Access Model**  | Single shared account, PIN-protected                                              |
| **Cooking Style** | Mix of batch prep (weekends) and fresh cooking (weekdays)                         |
| **Location**      | Indonesia (IDR currency, local ingredients)                                       |
| **Pain Points**   | Decision fatigue, repetitive meals, grocery overbuying                            |
| **Goals**         | Plan meals in under 15 minutes/week, stay within grocery budget, eat more variety |

---

## 4. Feature Specification

### 4.1 Feature Priority Matrix

| #   | Feature             | Priority     | Description                                                                 |
| --- | ------------------- | ------------ | --------------------------------------------------------------------------- |
| 1   | Weekly Meal Planner | 🟢 P0 (Must) | 7-day calendar with breakfast/lunch/dinner slots and drag-and-drop support  |
| 2   | Recipe Manager      | 🟢 P0 (Must) | Add recipes manually; includes ingredients, steps, servings, prep/cook time |
| 3   | Budget Tracker      | 🟢 P0 (Must) | Weekly grocery budget in IDR with spending log and progress visualization   |
| 4   | Auto Grocery List   | 🟢 P0 (Must) | Auto-generated shopping checklist aggregated from the weekly meal plan      |

### 4.2 Feature Details

#### 4.2.1 Weekly Meal Planner (P0)

The centerpiece of PrepPair. A visual 7-day calendar grid with three meal slots per day (breakfast, lunch, dinner).

- **Calendar View:** Week-at-a-glance with clear day columns. Navigate between weeks easily.
- **Drag & Drop:** Move meals between slots or days to rearrange the plan quickly.
- **Cooking Style Tags:** Mark recipes as "batch prep" or "fresh cook" to support the couple's mixed approach.
- **Meal Status:** Mark individual slots as cooked or skipped — this tracks meal habits over time.

#### 4.2.2 Recipe Manager (P0)

A personal recipe library with manual entry.

- **Manual Entry:** Structured form for recipe name, ingredients (with quantities and units), steps, prep time, cook time, servings, category, tags, and photo URL.
- **Organization:** Tags, categories (e.g., Indonesian, Japanese, Western), favorites, and search/filter.
- **Scaling:** Adjust serving size and all ingredient quantities auto-recalculate.
- **Favorites:** Mark recipes as favorites for quick access during planning.

#### 4.2.3 Budget Tracker (P0)

Track grocery spending against a weekly budget in IDR.

- **Budget Setting:** Set a weekly target in IDR. Visual progress bar shows spending vs. budget.
- **Expense Logging:** Log grocery expenses with amount, store name, and date. Simple and fast.
- **Cost Estimation:** Each recipe can store an estimated cost. The weekly plan shows projected total spending.
- **Weekly Trend:** View spending history across past weeks to spot patterns.

#### 4.2.4 Auto Grocery List (P0)

Automatically generates a consolidated shopping list from the weekly meal plan.

- **Ingredient Aggregation:** Combines duplicate ingredients across recipes (e.g., two recipes needing garlic = total garlic needed).
- **Categorization:** Groups items by type (produce, protein, dairy, pantry, etc.) for easier shopping.
- **Check-off Mode:** Interactive checklist for use while shopping at the store on your phone.

---

## 5. Core User Flow

| Step | Action                    | Detail                                                                                           |
| ---- | ------------------------- | ------------------------------------------------------------------------------------------------ |
| 1    | **Setup**                 | Open app for the first time. Set a PIN, configure weekly budget (IDR), and default servings (2). |
| 2    | **Add Recipes**           | Manually enter family recipes. Build a personal recipe library.                                  |
| 3    | **Plan the Week**         | Open weekly calendar. Drag recipes into breakfast/lunch/dinner slots.                            |
| 4    | **Generate Grocery List** | App consolidates all ingredients, groups by category, estimates cost in IDR.                     |
| 5    | **Shop & Check Off**      | Use the grocery checklist at the store. Log total spending when done.                            |
| 6    | **Cook & Track**          | Follow recipe from app. Mark meals as cooked or skipped. Favorite the ones you loved.            |
| 7    | **Repeat**                | Next week, start a new plan informed by what worked.                                             |

---

## 6. Technical Architecture

### 6.1 Recommended Tech Stack

| Layer         | Technology                       | Rationale                                                                        |
| ------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| **Framework** | React Router v7 (Framework Mode) | Full-stack monolith — handles both UI and server-side logic (loaders, actions)   |
| **Language**  | TypeScript (end-to-end)          | Single language across the entire stack for maximum productivity and type safety |
| **Database**  | PostgreSQL                       | Robust relational DB for structured meal/recipe/budget data                      |
| **ORM**       | Drizzle ORM                      | Type-safe, SQL-first, lightweight                                                |
| **Styling**   | Tailwind CSS v4 + shadcn/ui      | Utility-first CSS with accessible component library                              |
| **Auth**      | PIN-based (bcrypt hashed)        | Simple PIN protection for personal use; no OAuth overhead                        |
| **Hosting**   | Vercel / Cloudflare              | Edge deployment, excellent PWA caching, free tier for personal use               |

### 6.2 Architecture Overview

PrepPair is a full-stack monolith built on React Router v7 in framework mode. Server-side loaders and actions handle data fetching and mutations, while the client-side renders the PWA interface. PostgreSQL provides persistent storage.

1. **PWA Features:** Service worker for offline support (view cached meal plans and recipes offline), installable on home screen.
2. **Server-Side Logic:** React Router v7 loaders and actions serve as the backend layer — no separate API server needed.
3. **Database Schema:** Core tables: `users`, `recipes`, `recipe_ingredients`, `meal_plans`, `meal_slots`, `grocery_items`, `budget_entries`. Single-user scoped with `userId` foreign keys. Designed for easy migration to multi-user if going public.

---

## 7. Development Timeline

The project is structured into five phases over approximately 10 weeks:

| Phase       | Duration   | Focus             | Key Deliverables                                                       |
| ----------- | ---------- | ----------------- | ---------------------------------------------------------------------- |
| **Phase 1** | Weeks 1–2  | Foundation        | Project scaffolding, PIN auth, DB schema, app layout shell             |
| **Phase 2** | Weeks 3–4  | Recipe Management | Recipe CRUD with ingredients, steps, favorites, search/filter          |
| **Phase 3** | Weeks 5–6  | Meal Planner      | Weekly calendar with drag-and-drop, meal status tracking               |
| **Phase 4** | Weeks 7–8  | Grocery & Budget  | Auto grocery list, budget tracking with charts                         |
| **Phase 5** | Weeks 9–10 | PWA & Polish      | Service worker, offline support, install prompt, error handling, tests |

---

## 8. Success Metrics

### 8.1 Personal Use KPIs

1. Weekly meal plan completion rate (target: 80% of slots filled and followed)
2. Grocery budget adherence (target: within 10% of weekly budget)
3. Meal variety index (target: no more than 2 repeated meals per week)
4. Food waste reduction (qualitative: noticeable decrease in discarded groceries)
5. Time saved on meal decisions (target: plan completed in under 15 minutes/week)

### 8.2 Public Launch KPIs (Future)

1. User acquisition and retention (weekly active users)
2. Feature engagement rates
3. Net Promoter Score (NPS) from user surveys
4. PWA install rate

---

## 9. Risks & Mitigations

| Risk              | Impact                                  | Mitigation                                                        |
| ----------------- | --------------------------------------- | ----------------------------------------------------------------- |
| **Scope Creep**   | Feature richness may delay launch       | Strict P0 prioritization; all AI features deferred to post-launch |
| **Data Loss**     | Personal data on a single device/server | Regular PostgreSQL backups; future: export/import functionality   |
| **Adoption Risk** | Partner may not use the app             | Keep the UX extremely simple; optimize for speed over features    |

---

## 10. Future Considerations

The following features are out of scope for v1.0 but the architecture is designed to support them:

**AI Integration (v2)**

- AI-powered meal suggestions based on favorites, history, and budget (LangChain + Ollama/OpenAI/Anthropic)
- Recipe URL import — paste a URL, AI extracts structured recipe data (Cheerio + LLM)
- Nutritional analysis per meal and per day
- Smart grocery list optimization (suggest substitutions, budget-friendly alternatives)

**Multi-User & Collaboration (v3)**

- Multi-user accounts with individual logins (email/OAuth via Auth.js)
- Household workspaces with invite codes and role-based access (owner/member)
- Real-time collaborative editing via SSE or WebSocket
- Approval workflow (one partner proposes, the other approves)
- Activity feed showing who changed what

**Enhanced Tracking (v3)**

- Meal rating system (1–5 stars) for richer preference learning
- Batch cook planner with weekend prep schedules
- Leftover manager with expiry tracking
- Week templates (save and reuse successful meal plans)

**Integrations (v4)**

- Integration with Indonesian grocery delivery services (e.g., Segari, TokopediaNOW)
- OCR-based receipt scanning for automated budget entry
- Pantry inventory management with barcode scanning
- Cooking timer and step-by-step guided cooking mode
- Multi-language support (Bahasa Indonesia and English)
- Health/fitness app integration for calorie and macro sync
- Social features: share meal plans with friends and family

---

## 11. Appendix

### 11.1 Glossary

| Term              | Definition                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **PWA**           | Progressive Web App. A web application that provides a native app-like experience with offline support and home screen installation. |
| **IDR**           | Indonesian Rupiah, the currency used for all budget tracking.                                                                        |
| **Batch Cooking** | Preparing large quantities of food in advance (typically on weekends) to eat throughout the week.                                    |
| **P0**            | Priority level. Must have for launch.                                                                                                |

### 11.2 References

- FinIslam project architecture (internal reference for tech stack decisions)
- React Router v7 documentation: https://reactrouter.com
- Drizzle ORM documentation: https://orm.drizzle.team

---

_End of Document_
