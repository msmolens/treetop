[![CI](https://github.com/msmolens/treetop/workflows/CI/badge.svg)](https://github.com/msmolens/treetop/actions?query=workflow%3ACI)

# ![Treetop logo](src/icons/generated/icons/icon48.png) Treetop

Treetop is a browser extension that provides a high-level live view of your bookmarks:

![Screenshot of Treetop](images/screenshots/treetop.png)

## Usage

### Getting started

- Open Treetop by clicking its icon in the toolbar.

- Treetop shows all your bookmarks on a single page.

### Always up-to-date

- Treetop updates automatically as you browse.

- Recently visited bookmarks have a larger font.

### Find and edit your bookmarks

- Search for bookmarks by name or URL.

- Right-click to edit or delete bookmarks and folders.

### Customize

- Click the Preferences button to customize Treetop's display.

- Click on a folder to make it the root folder.

## Development

### Requirements

- [Node.js](https://nodejs.org/) 20.x or greater
- Google Chrome or Firefox browser

### Prerequisites

Install dependencies:

```
npm install --global web-ext
npm install
```

### Commands

| Command                                                  | Description                                                                                                                                               |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build:watch`                                    | Build for development, watching for file changes.                                                                                                         |
| `TREETOP_TARGET=chrome npm run build`                    | Build for Chrome.                                                                                                                                         |
| `TREETOP_TARGET=firefox npm run build`                   | Build for Firefox.                                                                                                                                        |
| `npm run check`                                          | Check for unused CSS, a11y issues, and compiler errors with [svelte-check](https://github.com/sveltejs/language-tools/tree/master/packages/svelte-check). |
| `npm run lint`                                           | Check code for linting errors.                                                                                                                            |
| `npm run lint:fix`                                       | Fix linting errors.                                                                                                                                       |
| `npm run prettier`                                       | Check code for formatting errors.                                                                                                                         |
| `npm run prettier:fix`                                   | Fix formatting errors.                                                                                                                                    |
| `npm test`                                               | Run tests.                                                                                                                                                |
| `web-ext run --source-dir dist/chrome --target chromium` | Start Chrome and load the extension temporarily.                                                                                                          |
| `web-ext run --source-dir dist/firefox`                  | Start Firefox and load the extension temporarily.                                                                                                         |
| `web-ext build --source-dir dist/chrome`                 | Package the built extension for Chrome.                                                                                                                   |
| `web-ext build --source-dir dist/firefox`                | Package the built extension for Firefox.                                                                                                                  |

### Core Technologies

#### Development

- [Svelte](https://svelte.dev/): Component framework.
- [TypeScript](https://www.typescriptlang.org/): Typed JavaScript.
- [Vite](https://vitejs.dev/): Build tool.
- [Svelte Material UI](https://sveltematerialui.com/): Material UI components for Svelte.
- [ESLint](https://eslint.org/): Static analyzer.
- [Prettier](https://prettier.io/): Code formatter.
- [web-ext](https://github.com/mozilla/web-ext): Command line tool for web extensions.

#### Testing

- [Vitest](https://vitest.dev/): Testing framework.
- [DOM Testing Library](https://testing-library.com/): Framework to test Svelte components.

## History

Treetop is a modern remake of my [My Portal](https://github.com/msmolens/myportal)
XUL/XPCOM Firefox extension.
