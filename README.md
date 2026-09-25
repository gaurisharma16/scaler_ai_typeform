# Typeform Clone

A functional clone of Typeform: a drag-and-drop form builder, a public one-question-at-a-time
respondent flow, and a results/stats dashboard.

## Tech stack

- Frontend: Next.js 16 (App Router, TypeScript), Tailwind CSS, framer-motion, @dnd-kit
- Backend: FastAPI (Python), SQLAlchemy
- Database: SQLite

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The database file (`typeform_clone.db`) and seed data (2 published forms, 1 draft, several
responses including a partial one) are created automatically on first run.

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:8000` (set via `NEXT_PUBLIC_API_URL` in
`frontend/.env.local`, already included).

App: http://localhost:3000/forms

### Deployment

Deploy the backend to Render and the frontend to Vercel.

1. Create a Render web service from this repository with root directory `backend`, build command `pip install -r requirements.txt`, and start command `uvicorn main:app --host 0.0.0.0 --port $PORT`.
2. Create a Vercel project from this repository with root directory `frontend`.
3. Set the Vercel environment variable `BACKEND_URL` to the deployed Render URL, for example `https://your-api.onrender.com`.
4. Redeploy the Vercel project, then open its `/forms` route.

The backend currently uses SQLite, so its local database is not durable across ephemeral host redeploys. Use a persistent disk or managed database before production use.

## Architecture overview

```
repo/
  backend/
    app/
      models.py        SQLAlchemy models
      schemas.py        Pydantic request/response schemas
      seed.py            seeds a default creator, 3 forms, and sample responses
      routers/
        forms.py         form CRUD, publish/unpublish, duplicate
        questions.py      question CRUD + reorder (builder)
        public.py          public respondent flow (no auth), server-side validation
        responses.py        results list/detail, stats, CSV export
    main.py              FastAPI app, CORS, table creation, startup seed
  frontend/
    app/
      forms/                dashboard (list, create, rename, duplicate, delete, publish)
      forms/[id]/edit/        three-column builder (question list, editor, live preview)
      forms/[id]/results/      response table, response detail modal, per-question stats
      f/[slug]/                 public respondent flow (one question at a time)
      f/[slug]/thank-you/        thank-you screen
    lib/
      api.ts                   typed fetch wrapper for every backend endpoint
      types.ts                  shared TypeScript types matching the Pydantic schemas
    components/
      builder/                 SortableQuestion, QuestionEditor, LivePreview
      respondent/               QuestionField (per question type input), ProgressBar
      ui/                        Toast, Modal, Button
```

There is no real authentication. A single default creator is seeded on first run and every
form belongs to it, per the assignment's simplification.

## Database schema

```sql
creators(id, name, email)

forms(
  id, creator_id, title, status,       -- draft | published
  share_slug, theme, thank_you_message,
  created_at, updated_at
)

questions(
  id, form_id, type, title, description,
  required, order_index, settings       -- JSON, e.g. {"max_rating": 5}
)

question_options(id, question_id, label, order_index)   -- multiple_choice / dropdown only

responses(id, form_id, started_at, completed_at, completed)

answers(id, response_id, question_id, value_text, value_json)
```

Design notes:
- `settings` (questions) and `theme` (forms) are JSON columns so per-type or per-form config
  doesn't need new tables.
- `question_options` only applies to `multiple_choice` and `dropdown`.
- `responses.completed` + nullable `completed_at` gives partial-response tracking for free.

## API overview

**Forms**
`GET|POST /api/forms`, `GET|PATCH|DELETE /api/forms/{id}`,
`POST /api/forms/{id}/duplicate`, `POST /api/forms/{id}/publish`, `POST /api/forms/{id}/unpublish`

**Questions (builder)**
`POST /api/forms/{id}/questions`, `PATCH|DELETE /api/questions/{id}`,
`POST /api/forms/{id}/questions/reorder`

**Public respondent flow (no auth)**
`GET /api/public/forms/{slug}`,
`POST /api/public/forms/{slug}/responses/start`,
`PATCH /api/public/responses/{id}/answers` (upserts one answer, enables partial persistence),
`POST /api/public/responses/{id}/submit` (re-validates every required question server-side)

**Results**
`GET /api/forms/{id}/responses`, `GET /api/forms/{id}/responses/{response_id}`,
`GET /api/forms/{id}/stats`, `GET /api/forms/{id}/responses/export.csv`

Full interactive schema at `/docs` once the backend is running.

## Question types supported

short_text, long_text, multiple_choice, dropdown, email, number, yes_no, rating — each with a
required toggle and optional description/help text.

## What's implemented

- Builder: add/edit/reorder (drag-and-drop)/delete questions, per-question settings, live preview
- Form management: list with status + response count, create/rename/duplicate/delete, publish/unpublish
- Respondent flow: one question at a time, keyboard navigation (Enter/arrows), progress bar,
  client + server validation, partial-answer persistence, thank-you screen
- Results: response table, individual response detail, per-question summary stats, CSV export
- Toasts and modals throughout the builder/dashboard

## Bonus features implemented

- CSV export of responses
- Partial-response tracking (a response can be started and abandoned; shows as "Partial" in results)
- Per-form theme color, applied throughout the public respondent flow

## Assumptions

- Single default creator; no real login. All forms are visible/editable by anyone using the app.
- A form must have at least one question before it can be published.
- Deleting a form cascades to its questions, options, responses, and answers.
