---
title: Testing components that use TranslateService
description: How to mock or stub TranslateService in component tests using the ITranslateService interface.
---

v18 exposes `ITranslateService` — an abstract class that declares the shape of
the public `TranslateService` API. It is re-exported from the main entry point
(`@ngx-translate/core`) and is useful as a type contract for test fakes and
library code that wants to depend on the API surface without pulling in the
full service implementation.

## Mock with a partial implementation

For most component tests you only need a few methods. Use `Partial<ITranslateService>`
and cast through `as unknown as ITranslateService` when wiring up the provider:

```ts
import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
    TranslateService,
    ITranslateService,
    Language,
} from "@ngx-translate/core";
import { of } from "rxjs";

const fakeTranslateService: Partial<ITranslateService> = {
    currentLang: signal<Language | null>("en"),
    fallbackLang: signal<Language | null>("en"),
    instant: (key: string | string[]) => `[${key as string}]`,
    get: (key: string | string[]) => of(`[${key as string}]`),
};

TestBed.configureTestingModule({
    providers: [
        { provide: TranslateService, useValue: fakeTranslateService },
    ],
});
```

The cast through `unknown` is needed because `Partial<ITranslateService>` is
not assignable to `ITranslateService` directly — but at the provider boundary
Angular only calls the methods your component actually uses, so a partial
fake is safe at runtime.

## Use the real service with `setTranslation()`

If your test exercises real translation lookup (interpolation, fallback chain),
use the real `TranslateService` and seed it directly:

```ts
import { TestBed } from "@angular/core/testing";
import { TranslateService, provideTranslateService } from "@ngx-translate/core";
import { firstValueFrom } from "rxjs";

TestBed.configureTestingModule({
    providers: [
        provideTranslateService({ fallbackLang: "en" }),
    ],
});

const translate = TestBed.inject(TranslateService);
translate.setTranslation("en", {
    greeting: "Hello {{ name }}",
});
await firstValueFrom(translate.use("en"));

const text = translate.instant("greeting", { name: "World" });
// text === "Hello World"
```

This avoids mocking the interpolation logic and keeps the test honest.
