// Recipe-verify for: 30-recipes/45-write-to-root-from-child.md
// Verifies that the FeatureToolbarComponent and the chain-walk code compile.

import { Component, inject } from "@angular/core";
import { TranslateService, ITranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-feature-toolbar-verify",
    template: ``,
})
class FeatureToolbarComponent {
    private translate = inject(TranslateService);

    seedShared(): void {
        this.translate.getRoot().setTranslation(
            "en",
            { "shared.copyright": "© 2026 Acme" },
            true,
        );
    }

    walkChain(): void {
        let service: ITranslateService | null = this.translate;
        while (service) {
            console.log(
                "layer:",
                service.currentLang(),
                service === service.getRoot() ? "(root)" : "",
            );
            service = service.getParent();
        }
    }
}

export const _verify_get_root_task_5_5_9 = FeatureToolbarComponent;
