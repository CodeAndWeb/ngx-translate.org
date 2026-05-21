// Recipe-verify for: 30-recipes/50-testing-with-itranslateservice.md
// Verifies that the ITranslateService partial-mock pattern and the
// real-service `setTranslation()` pattern compile against the public API.
//
// Note on `expect`: the recipe markdown shows a Jasmine/Jest `expect()`
// call, but the recipe-verify scaffold is an Angular CLI build (no test
// runner). To keep this a pure type-check, we COMPUTE the value the
// recipe asserts on, without calling `expect`. The shape and types match
// the recipe verbatim; only the assertion form is dropped.

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
    TranslateService,
    ITranslateService,
    Language,
    provideTranslateService,
} from "@ngx-translate/core";
import { firstValueFrom, of } from "rxjs";

// ── Code block 1: Partial<ITranslateService> mock ──

const fakeTranslateService_task_5_4: Partial<ITranslateService> = {
    currentLang: signal<Language | null>("en"),
    fallbackLang: signal<Language | null>("en"),
    instant: (key: string | string[]) => `[${key as string}]`,
    get: (key: string | string[]) => of(`[${key as string}]`),
};

export function configureFakeTranslate_task_5_4(): void {
    TestBed.configureTestingModule({
        providers: [
            { provide: TranslateService, useValue: fakeTranslateService_task_5_4 },
        ],
    });
}

// ── Code block 2: Real service with setTranslation() ──
// Wrapped in an async function so `await firstValueFrom(...)` is valid.

export async function setupRealTranslate_task_5_4(): Promise<string> {
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

    // Recipe asserts: expect(translate.instant("greeting", { name: "World" })).toBe("Hello World")
    // Here we just compute and return — verify-recipes is a type-check only.
    const text = translate.instant("greeting", { name: "World" }) as string;
    return text;
}
