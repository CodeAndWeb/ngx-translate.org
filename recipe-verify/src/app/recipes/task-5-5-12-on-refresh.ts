// Recipe-verify for: 30-recipes/15-react-to-translation-refresh.md
// Verifies that `onTranslationRefresh` is exposed on TranslateService as an
// Observable<void> and that subscribing to it from a component constructor
// (with manual unsubscribe in ngOnDestroy) type-checks under v18 / Angular
// strict mode.

import { Component, ElementRef, OnDestroy, inject } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";

@Component({ selector: "app-revenue-chart-verify", template: `` })
class RevenueChartComponent implements OnDestroy {
    private translate = inject(TranslateService);
    private el = inject<ElementRef<HTMLElement>>(ElementRef);
    private sub: Subscription;

    constructor() {
        this.sub = this.translate.onTranslationRefresh.subscribe(() => this.render());
    }

    private render(): void {
        const _title = this.translate.instant("revenue.title");
        // Touch `el` so the strict-mode "unused private" check passes.
        void this.el.nativeElement;
        void _title;
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }
}

export const _verify_on_refresh_task_5_5_12 = RevenueChartComponent;
