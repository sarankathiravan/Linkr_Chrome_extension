# Contributing to Linkr

Thanks for your interest in contributing to Linkr! We welcome contributions of
all kinds: bug reports, feature requests, documentation improvements, and
code changes. This document explains the process and standards we use so your
contributions are easy to review and merge.

## Table of Contents

- Getting started
- Development workflow
- Coding standards
- Tests
- Pull request process
- Non-code contributions

## Getting started

1. Fork the repository and clone your fork:

```bash
git clone https://github.com/<your-username>/Linkr_Chrome_extension.git
cd Linkr_Chrome_extension
```

2. Create a branch for your work:

```bash
git checkout -b feature/brief-description
```

3. Install tooling (if applicable)

This project is a pure Chrome extension using HTML/CSS/JS — there are no
required build tools by default. If you'd like to run locally in a dev
workflow, the easiest way is to load the extension unpacked in Chrome (see
the Quick Setup in the README). If you add tooling (linters, bundlers, or a
test runner), please add clear steps here.

### Running locally (development)

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable Developer mode.
3. Click "Load unpacked" and select the repository folder.
4. Make changes in your editor and refresh the extension in Chrome to see
  updates.

## Development workflow

- Keep changes small and focused. A single pull request should address one
  logical change.
- Write clear, descriptive commit messages. Use imperative mood (e.g., "Add
  export feature").
- Rebase or squash commits as appropriate when your feature is ready for a
  clean history.

### Commit message convention

- Use present-tense, imperative messages: "Add feature", "Fix bug"
- Include a short summary (max 72 chars) and an optional body with details.
- Reference issues when applicable: `Fixes #12`.

## Coding standards

- Use plain, readable JavaScript (ES6+). If you introduce a new build step or
  transpiler, include configuration files and documentation.
- Keep CSS modular and prefixed when necessary to avoid collisions.
- Keep DOM manipulation and data logic separated where practical.
- Add comments for non-obvious behavior.

## Tests

This repository does not include an automated test suite by default. If you add
tests, please include a short README section on how to run them and make sure
they are fast and deterministic.

Suggested testing ideas for contributors:

- Manual smoke test: load unpacked extension and exercise the main flows
  (save link, edit, delete, search).
- Add unit tests for any pure JavaScript modules you extract.

If you'd like help adding a test harness (e.g., Jest + jsdom) open an issue
and we can coordinate a small, minimal setup.

## Pull request process

1. Open a pull request against the `master` branch.
2. Include a concise description of the change and why it is needed.
3. Reference any related issues using `#<issue-number>`.
4. A maintainer will review and may request changes. Please respond promptly
   to review comments.
5. Once approved, a maintainer will merge your PR.

### PR checklist

- [ ] The PR is small and focused
- [ ] Commits are squashed/rebased for a clean history
- [ ] Code follows the style and has comments where necessary
- [ ] Documentation updated (if applicable)
- [ ] Manual smoke-tested in a browser


## Non-code contributions

Contributions to documentation, examples, and design are highly valued. For
content changes, please open a PR with the changes and a brief explanation.

## Code of Conduct

By participating in this project, you agree to abide by the
[`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

Thank you for helping make Linkr better!
