# Team 1 2025 Project

## Overview

This project is a web application for managing and analyzing session-based questionnaires. It features a Svelte frontend with interactive charts, session analytics, and a modular component structure. The application is organized for maintainability and scalability, supporting multiple sprints and feature folders.

## Features

- Session management and analytics
- Interactive charts for ratings and durations
- Responsive UI with modern design
- Modular Svelte components
- End-to-end and unit testing
- Storybook stories for UI components

## Folder Structure

- `frontend/` – Main Svelte application
  - `src/` – Source code
    - `lib/components/` – Svelte components (e.g., SessionGraphs, TemplateSelector)
    - `lib/stores/` – Svelte stores for state management
    - `lib/data/` – Static data (e.g., templates.json)
    - `routes/` – SvelteKit routes
    - `stories/` – Storybook stories and assets
    - `static/` – Static files (robots.txt, etc.)
  - `build/` – Production build output
  - `package.json` – Frontend dependencies and scripts
  - `README.md` – Frontend documentation
- `sprint 4/`, `Sprint 8/` – Sprint-specific code and features

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/itcOnlineGaming/Team_1_2025
   cd Team_1_2025/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the SvelteKit development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173/Team_1` (or the port shown in the terminal).

### Building for Production

To build the frontend for production:

```bash
npm run build
```

The output will be in the `build/` directory.

### Running Tests

- **End-to-end tests (Playwright):**
  ```bash
  npm run test
  ```

### Storybook

To view UI component stories:

```bash
npm run storybook
```

## Key Components

- `SessionGraphs.svelte`: Displays session analytics with charts and tables.
- `TemplateSelector.svelte`: Allows users to select questionnaire templates.
- `SessionManager.svelte`: Handles session lifecycle and state.
- `EvaluationQuestionnaire.svelte`: Renders questionnaire forms.

## Customization

- Modify styles in `app.css` and component CSS files.
- Add new components in `src/lib/components/`.
- Update session logic in `src/lib/stores/sessionStore.ts`.

## Troubleshooting

- If you encounter issues, ensure Node.js and npm are up to date.
- Check for missing dependencies with `npm install`.
- Review the terminal output for error messages.

---
