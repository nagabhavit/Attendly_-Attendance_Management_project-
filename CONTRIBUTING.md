# Contributing to Attendly

Thanks for taking the time to contribute! 🎉

## Workflow

1. Fork the repository and create a branch from `main`:
   `git checkout -b feat/short-description`
2. Make your change. Keep pull requests small and focused.
3. Run the checks before pushing:
   ```bash
   cd server && npm test
   cd ../client && npm run build
   ```
4. Open a pull request describing **what** changed and **why**.

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Type | Use for |
|---|---|
| `feat` | a new feature |
| `fix` | a bug fix |
| `docs` | documentation only |
| `style` | formatting, CSS, no logic change |
| `refactor` | code change that neither fixes a bug nor adds a feature |
| `test` | adding or fixing tests |
| `chore` | tooling, config, dependencies |
| `ci` | CI configuration |

Example: `feat(client): add low attendance banner`

## Code style

- 2-space indentation, LF line endings (see `.editorconfig`)
- Prefer small, pure functions — attendance maths lives in `utils/stats.js`
- No secrets in commits; use `.env` (see `server/.env.example`)
