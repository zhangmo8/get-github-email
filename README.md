# GitHub Email- 📧 **Multiple Email Discovery** - Discovers all public emails associated with a userFinder

A browser extension to find GitHub user's email address by username. This extension helps you discover public email addresses associated with GitHub users by analyzing their profile, commit history, and public events.

<p align="center">
<sub>Main Interface</sub><br/>
<img width="400" src="https://via.placeholder.com/400x500/4285f4/ffffff?text=GitHub+Email+Finder"><br/>
<sub>Search results showing found emails</sub><br/>
<img width="400" src="https://via.placeholder.com/400x300/22c55e/ffffff?text=Email+Results">
</p>

## Features

- 🔍 **Smart Search** - Find emails from multiple sources (profile, commits, events)
- � **Multiple Email Discovery** - Discovers all public emails associated with a user
- 📱 **Modern UI** - Clean and intuitive interface
- 📚 **Search History** - Keep track of previous searches
- 📋 **One-Click Copy** - Easy copying of found email addresses
- ⚡️ **Fast & Efficient** - Optimized API calls to avoid rate limiting
- 🚀 **Real-time Results** - Instant feedback and loading states

## How It Works

The extension searches for GitHub user emails through:

1. **Profile Email** - Checks if the user has made their email public in their profile
2. **Commit History** - Analyzes recent commits in user's repositories
3. **Public Events** - Examines public push events for commit author information

## Privacy & Ethics

- Only searches for **publicly available** information
- Respects GitHub's API rate limits
- Filters out private/noreply email addresses
- Does not store or share personal data externally

> If you don't have pnpm installed, run: npm install -g pnpm

```bash
npx degit antfu/vitesse-webext my-webext
cd my-webext
pnpm i
```

## Usage

### Folders

- `src` - main source.
  - `contentScript` - scripts and components to be injected as `content_script`
  - `background` - scripts for background.
  - `components` - auto-imported Vue components that are shared in popup and options page.
  - `styles` - styles shared in popup and options page
  - `assets` - assets used in Vue components
  - `manifest.ts` - manifest for the extension.
- `extension` - extension package root.
  - `assets` - static assets (mainly for `manifest.json`).
  - `dist` - built files, also serve stub entry for Vite on development.
- `scripts` - development and bundling helper scripts.

### Development

```bash
pnpm dev
```

Then **load extension in browser with the `extension/` folder**.

For Firefox developers, you can run the following command instead:

```bash
pnpm dev-firefox
```

`web-ext` auto reload the extension when `extension/` files changed.

> While Vite handles HMR automatically in the most of the case, [Extensions Reloader](https://chrome.google.com/webstore/detail/fimgfedafeadlieiabdeeaodndnlbhid) is still recommended for cleaner hard reloading.

## Using Gitpod

If you have a web browser, you can get a fully pre-configured development environment with one click:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/antfu/vitesse-webext)

### Build

To build the extension, run

```bash
pnpm build
```

And then pack files under `extension`, you can upload `extension.crx` or `extension.xpi` to appropriate extension store.

## Credits

[![Volta](https://user-images.githubusercontent.com/904724/195351818-9e826ea9-12a0-4b06-8274-352743cd2047.png)](https://volta.net)

This template is originally made for the [volta.net](https://volta.net) browser extension.

## Variations

This is a variant of [Vitesse](https://github.com/antfu/vitesse), check out the [full variations list](https://github.com/antfu/vitesse#variations).
