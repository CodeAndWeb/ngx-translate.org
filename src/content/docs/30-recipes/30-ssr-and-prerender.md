---
title: SSR and Angular Universal
description: How ngx-translate v18 behaves under server-side rendering and prerendering.
---

ngx-translate v18 works under Angular Universal / SSR with a few things to know.

## How it works

The v18 pipe and directive are signal-driven. `TranslateService.translate()`
returns a `computed()` signal that resolves to a synchronous `instant()`
lookup against the currently loaded translations. The pipe is declared
`pure: false` and reads that signal on every change-detection cycle; the
directive wraps the same signal in an `effect()` that writes the value to
the DOM.

Because the underlying read is synchronous, the server render produces a
fully translated DOM in one pass — there is no async boundary to await.
If the same language is loaded on both server and client, the rendered
text matches and hydration succeeds without flicker.

## Avoiding double-fetch with TransferState

The HTTP loader makes real `HttpClient` requests during prerender. Without
intervention, the same translation files are fetched again on the client
right after hydration. There are two common patterns to avoid this.

### Pattern 1: Pre-load via APP_INITIALIZER

Ship your translations as a bundled JSON and call `setTranslation()` (or
`setCompiledTranslation()` if you precompile) in an `APP_INITIALIZER`. The
HTTP loader is then never invoked for the languages you pre-load.

```ts title="app.config.ts"
import { APP_INITIALIZER, ApplicationConfig, inject } from "@angular/core";
import { provideTranslateService, TranslateService } from "@ngx-translate/core";
import enTranslations from "../public/i18n/en.json";

export const appConfig: ApplicationConfig = {
    providers: [
        provideTranslateService({ fallbackLang: "en" }),
        {
            provide: APP_INITIALIZER,
            multi: true,
            useFactory: () => {
                const translate = inject(TranslateService);
                return () => {
                    translate.setTranslation("en", enTranslations);
                    return translate.use("en");
                };
            },
        },
    ],
};
```

### Pattern 2: TransferState

Wire Angular's `TransferState` between server and client. The server-side
HTTP loader writes the response into TransferState; the client-side loader
reads from TransferState before falling back to HTTP. This pattern is the
same as the standard Angular SSR data-transfer recipe; the ngx-translate
HTTP loader is a `HttpClient` consumer so the standard
`provideClientHydration({ withHttpTransferCacheOptions: ... })` setup
already covers it for most projects.

## Lifecycle notes

- `onTranslationChange`, `onLangChange`, and `onFallbackLangChange` are
  Subject-backed Observables. v18 wires a `DestroyRef.onDestroy` hook that
  completes those Subjects when the owning injector tears down, so child
  services on lazy routes (and the server-side injector after a render)
  release their subscribers cleanly — no special handling needed in component
  code. `onTranslationRefresh` is a derived Observable (`merge` of the three
  above) and completes transitively when its sources complete.
- Language switching between server and client (e.g. a language cookie
  read on the client after hydration) will produce a visible flash from
  the server-rendered language to the client-rendered language. Use a
  Universal request-token to read the cookie on the server and pre-load
  the matching language via Pattern 1 if you need to avoid the flash.
