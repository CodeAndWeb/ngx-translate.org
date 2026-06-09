---
title: Pre-compile translations at build time
description: Use setCompiledTranslation() to skip the runtime compiler for known translations.
slug: recipes/precompile-translations
---

`setTranslation()` runs the configured `TranslateCompiler` over the values
you pass. For a small app, this is invisibly fast. For a large translations
bundle on a cold-start-sensitive page, the compile pass can matter.

`setCompiledTranslation()` lets you skip the runtime compiler if you've
already compiled the translations at build time:

```ts
this.translate.setCompiledTranslation("en", {
    welcome: "Welcome",
    greeting: (params) => `Hello ${params["name"]}`,
});
```

The function-valued entries are interpolation functions in their final form.
v18 calls them directly when the key is requested.

## When this is worth it

Use `setCompiledTranslation()` if:
- Your translations bundle is large (≥ ~1000 keys with interpolation).
- Cold start time matters (PWA, embedded widget, SSR-hydrated app).
- You have a build step that can produce interpolation functions.

For most apps, the standard `setTranslation()` path is fine — the runtime
compiler is cheap.

## Build pipeline sketch

The build step's job is to turn:

```json
{ "greeting": "Hello {{name}}" }
```

into:

```ts
{ greeting: (params) => `Hello ${params["name"]}` }
```

The exact tooling depends on your stack (a small Node script, an Angular
build plugin, a Vite transformer). Once built, import the result and feed
it to `setCompiledTranslation()`:

```ts title="app.config.ts"
import { ApplicationConfig, APP_INITIALIZER, inject } from "@angular/core";
import { provideTranslateService, TranslateService } from "@ngx-translate/core";
import enCompiled from "./i18n/en.compiled";

export const appConfig: ApplicationConfig = {
    providers: [
        provideTranslateService({ fallbackLang: "en" }),
        {
            provide: APP_INITIALIZER,
            multi: true,
            useFactory: () => {
                const translate = inject(TranslateService);
                return () => {
                    translate.setCompiledTranslation("en", enCompiled);
                    return translate.use("en");
                };
            },
        },
    ],
};
```

`use("en")` resolves immediately (no HTTP fetch, no compile pass) because
the translations are already in the store.

## Pair with a no-op TranslateCompiler

To prevent any accidental re-compile pass on values that arrive via
`setTranslation()` later (e.g. a runtime extension), provide a no-op compiler.

v18 ships one out of the box — `TranslateNoOpCompiler`:

```ts
import {
    provideTranslateService,
    provideTranslateCompiler,
    TranslateNoOpCompiler,
} from "@ngx-translate/core";

provideTranslateService({
    fallbackLang: "en",
    compiler: provideTranslateCompiler(TranslateNoOpCompiler),
});
```

If you want your own subclass (e.g. to log or count compile calls), the
shape matches the abstract `TranslateCompiler` base class exactly — note
that `compileTranslations()` takes a `TranslationObject` and returns an
`InterpolatableTranslationObject`:

```ts
import {
    TranslateCompiler,
    Language,
    TranslationObject,
    InterpolatableTranslationObject,
    InterpolateFunction,
} from "@ngx-translate/core";

class NoopTranslateCompiler extends TranslateCompiler {
    compile(value: string, _lang: Language): string | InterpolateFunction {
        return value;
    }
    compileTranslations(
        translations: TranslationObject,
        _lang: Language,
    ): InterpolatableTranslationObject {
        return translations as InterpolatableTranslationObject;
    }
}
```

The cast is needed because the base class widens its return type — for a
no-op, we're asserting "these strings are already in their final form".

Register it alongside the service:

```ts
provideTranslateService({
    fallbackLang: "en",
    compiler: provideTranslateCompiler(() => new NoopTranslateCompiler()),
});
```
