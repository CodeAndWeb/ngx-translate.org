---
title: Fail the build when a translation file is missing
description: Use failOnError to make missing translation files break the deploy instead of silently serving partial content.
---

v18's HTTP loader is **permissive by default**: if a translation JSON 404s, the
loader logs a `console.warn` and serves an empty object for that resource.
Remaining resources still contribute their keys. This is good for development
(one missing file doesn't take down the whole app) but bad for production —
a forgotten file silently ships with translation keys appearing as their raw
IDs ("welcome.title" instead of "Welcome").

`failOnError: true` flips the behavior: a failed HTTP fetch propagates the
error and fails the whole language load.

## Set failOnError on the HTTP loader

```ts title="app.config.ts"
import { ApplicationConfig, isDevMode } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { provideTranslateService } from "@ngx-translate/core";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(),
        provideTranslateService({
            loader: provideTranslateHttpLoader({
                prefix: "/i18n/",
                suffix: ".json",
                failOnError: !isDevMode(), // strict in prod, permissive in dev
            }),
            fallbackLang: "en",
        }),
    ],
};
```

`isDevMode()` from `@angular/core` is `true` under `ng serve` and `false`
in production builds. Using it here keeps developer ergonomics intact while
making prod fail loud.

## Same for the multi-resource loader

`failOnError` works on the multi-resource form too:

```ts
provideTranslateHttpLoader({
    resources: [
        "/i18n/common/",
        "/i18n/features/",
    ],
    failOnError: true,
});
```

When `failOnError: true`, **any** of the resources failing fails the whole
language load. Resources are merged via deep merge when all succeed.

## Wire it into your error handler

A failed language load surfaces through the `use()` observable:

```ts
this.translate.use("en").subscribe({
    next: () => console.log("loaded"),
    error: (err) => {
        // Send to error tracking. The deploy will be visibly broken to
        // the user, so this is for ops awareness, not user recovery.
        console.error("Translation load failed:", err);
    },
});
```

In SSR builds, this surfaces during prerender and fails the build, which is
the goal.
