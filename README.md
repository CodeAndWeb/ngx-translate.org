# ngx-translate.org - Documentation for @codeandweb/ngx-translate

Welcome to the documentation for **ngx-translate** and the **@codeandweb/ngx-translate** fork. 

If you encounter any bugs or have suggestions for improving the documentation, feel free to contribute by submitting a pull request.

And yes—I'm using **Starlight** and **React** to document an **Angular** library... so what? 😄


## 🌐 Website

For more detailed information, check out the [ngx-translate website](https://ngx-translate.org).


## 🧞 Commands

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

Below are the essential commands you'll need for working with this project. All commands are run from the root of the project in a terminal:

| Command               | Action                                            |
| :-------------------- | :------------------------------------------------ |
| `pnpm install`        | Installs dependencies                             |
| `pnpm dev`            | Starts a local dev server at `localhost:4321`     |
| `pnpm build`          | Builds your production site to `./dist/`          |
| `pnpm preview`        | Serves the built `./dist/` locally                |
| `pnpm astro ...`      | Runs CLI commands like `astro add`, `astro check` |
| `pnpm astro --help`   | Displays help for using the Astro CLI             |

Deployment happens on Cloudflare: Workers Builds builds every push to `main` and
deploys `./dist/` as static assets (see `wrangler.jsonc`).

