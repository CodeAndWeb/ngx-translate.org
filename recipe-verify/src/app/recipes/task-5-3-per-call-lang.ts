// Recipe-verify for: 30-recipes/40-per-call-language.md
// Verifies that the per-call `lang` examples (fixed-language label,
// pre-load options, stream-on-lang) compile against the public API.

import { Component, inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { TranslateService } from "@ngx-translate/core";

// ── Code block 1: BrandComponent — fixed-language label via instant() ──

@Component({ selector: "app-brand", template: `<span>{{ tagline }}</span>` })
export class BrandComponent_task_5_3 {
    private translate = inject(TranslateService);
    // instant("KEY", undefined, "en") — third arg is the per-call `lang`.
    // Cast to string because instant() returns Translation (string | TranslationObject);
    // in this recipe the key resolves to a string, so a narrow is safe.
    tagline = this.translate.instant("brand.tagline", undefined, "en") as string;
}

// ── Code blocks 2 + 3: pre-load options + stream-on-lang ──
// Wrapped in an Injectable so `this.translate` and `await` are valid.
// The recipe's snippets are shown without a wrapping class (they assume a
// component/service context); this service exists purely to type-check them.

@Injectable({ providedIn: "root" })
export class PerCallLangService_task_5_3 {
    private translate = inject(TranslateService);

    // Option A: load and switch the active language
    async preloadOptionA(): Promise<string> {
        await firstValueFrom(this.translate.use("de"));
        const text = this.translate.instant("greeting", undefined, "de"); // safe
        return text as string;
    }

    // Option B: load without switching the active language
    async preloadOptionB(): Promise<string> {
        await firstValueFrom(this.translate.reloadLang("de"));
        const text = this.translate.instant("greeting", undefined, "de"); // safe
        return text as string;
    }

    // Option C: seed translations manually (no loader call)
    preloadOptionC(): string {
        this.translate.setTranslation("de", { greeting: "Hallo" });
        const text = this.translate.instant("greeting", undefined, "de"); // safe
        return text as string;
    }

    // Live-update on a specific language's changes
    watchGermanGreeting(): void {
        this.translate
            .stream("greeting", undefined, "de")
            .subscribe((text) => console.log("German greeting is now:", text));

        // Later, somewhere else:
        this.translate.setTranslation("de", { greeting: "Servus" }, true);
        // The subscriber above fires with "Servus".
    }
}
