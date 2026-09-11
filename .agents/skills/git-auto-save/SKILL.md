---
name: git-auto-save
description: Automatically create safe Git commits after completed project edits in the e-stor-react repository.
---

# Git Auto Save

Use this skill whenever Antigravity changes code or project files in this repository.

## Required workflow

After each completed, coherent edit:

1. Check the repository root and current branch.
2. Review the changed-file list.
3. Never stage secrets or generated dependencies:
   - `.env`
   - `.env.*` except committed examples such as `.env.example`
   - `server/.env`
   - `.env.pgadmin`
   - `node_modules/`
   - `dist/` and other build output
4. Run the smallest relevant validation, usually `npm run build` for application changes.
5. Stage only the intended files.
6. Create a concise commit describing the completed change.
7. Report the commit hash and summary.

## Push policy

Do not push automatically after every edit. Push only when the user explicitly asks to publish/sync the changes to GitHub, or when the user has explicitly enabled automatic push for the current task.

## Safety rules

- Do not use `git reset --hard`, `git checkout --`, `git clean`, or any command that deletes uncommitted work.
- Do not amend or rewrite existing commits unless explicitly requested.
- If the working tree contains unrelated user changes, preserve them and commit only the files belonging to the current task.
- If Git reports an index or repository error, stop before staging and explain the repair needed.
- Do not commit database passwords, API keys, access tokens, private certificates, or user data.

## Commit style

Use short imperative messages, for example:

- `Add product API service`
- `Fix checkout validation`
- `Update product card layout`

This skill creates Git commits after completed agent edits; it does not claim to observe every operating-system file-save event made outside the agent.
