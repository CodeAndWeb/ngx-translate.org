---
title: React to any translation change
description: Use onTranslationRefresh to update non-template UI (canvas, charts, third-party widgets) when translations change.
slug: recipes/react-to-translation-refresh
---

The pipe and `*translateBlock` directive handle re-rendering automatically.
For content that lives outside Angular's template (canvas drawings, chart
libraries, third-party widget configs, custom DOM manipulation), you need a
single signal that fires on **any** translation-relevant change: a language
switch, a `setTranslation()` call, a fallback-language change, or a refresh
in a parent service.

v18 exposes `onTranslationRefresh: Observable<void>` for this. It merges
`onLangChange`, `onFallbackLangChange`, and `onTranslationChange` (filtered
to the current or fallback language) into one stream, and — for child
services — also includes the parent's refresh stream.

## Update a chart when translations change

```ts
import { Component, ElementRef, OnDestroy, inject } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";

@Component({ selector: "app-revenue-chart", template: "<canvas #canvas></canvas>" })
export class RevenueChartComponent implements OnDestroy {
    private translate = inject(TranslateService);
    private el = inject<ElementRef<HTMLElement>>(ElementRef);
    private sub: Subscription;

    constructor() {
        this.render();
        this.sub = this.translate.onTranslationRefresh.subscribe(() => this.render());
    }

    private render(): void {
        const t = (key: string) => this.translate.instant(key);
        // chart-library specific: re-render axis labels, legend, tooltips
        myChart.setOptions(this.el.nativeElement, {
            title: t("revenue.title"),
            xAxisLabel: t("revenue.x"),
            yAxisLabel: t("revenue.y"),
        });
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }
}
```

## Signal-based variant

If you prefer the v18 signal style, wrap the Observable into an effect:

```ts
import { Component, ElementRef, effect, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-revenue-chart",
    template: "<canvas></canvas>",
})
export class RevenueChartComponent {
    private translate = inject(TranslateService);
    private el = inject<ElementRef<HTMLElement>>(ElementRef);

    private refreshTick = toSignal(this.translate.onTranslationRefresh, {
        initialValue: undefined,
    });

    constructor() {
        effect(() => {
            this.refreshTick();
            this.render();
        });
    }

    private render(): void {
        // … same render code as above
    }
}
```

`toSignal()` converts the Observable into a Signal. Reading the signal inside
`effect()` makes the effect re-run on every emission, which re-renders the chart.

## What fires onTranslationRefresh

`onTranslationRefresh` emits when any of these happen on this service or its
parent chain:

- `use()` switches the active language
- `setFallbackLang()` changes the fallback language
- `setTranslation()` updates translations for the current or fallback language
- A parent service's translations change (child services inherit the parent
  refresh stream)

It does **not** emit on `instant()` / `get()` calls — those are read-side
operations.
