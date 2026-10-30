<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture

- FoodSource is a thin client: all data access goes through `src/lib/api/client.ts`, which calls the FastAPI backend when `VITE_API_URL` is set and otherwise falls back to the in-browser emulation in `src/lib/api/mock/` — why: the UI must work in preview without a backend while keeping the TZ API contract.
- Scoring, filtering, ranking badges and compare "best value" logic live only in the API layer (`mock/` mirrors backend `services/scoring.py`); components just render server results — why: keeps the client thin and the formula in one place.
- User notes/statuses are stored in localStorage via `src/hooks/use-notes.ts` — why: TZ scope excludes auth; notes are per-browser.
- All colors come from semantic tokens in `src/styles.css` (primary = brand yellow, ink = black surface) — why: consistent theming.
