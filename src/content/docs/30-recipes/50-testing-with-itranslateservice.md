---
title: Testing components that use TranslateService
description: How to mock or stub TranslateService in component tests using the ITranslateService interface.
slug: recipes/testing-with-itranslateservice
---

v18 exposes `ITranslateService` — an abstract class that declares the shape of
the public `TranslateService` API. It is re-exported from the main entry point
(`@ngx-translate/core`) and is useful as a type contract for test fakes and
library code that wants to depend on the API surface without pulling in the
full service implementation.

## Mock with a partial implementation

Use `Partial<ITranslateService>` to check the members your test provides. Include
`translate()` when the template uses `TranslatePipe`, which reads its returned signal.

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
    translate: () => signal("translated"),
};

TestBed.configureTestingModule({
    providers: [
        { provide: TranslateService, useValue: fakeTranslateService },
    ],
});
```

The `useValue` provider accepts the partial fake without a cast. `Partial` does
not check that every member used at runtime is present: add any other methods or
signals your component reads. This mock's `translate()` returns a fixed value;
use the real service below to test translation lookup or updates.

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
