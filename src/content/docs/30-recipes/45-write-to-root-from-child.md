---
title: Write to the root service from a child component
description: Use getRoot() and getParent() to access the top-level TranslateService from a hierarchical child.
---

In a hierarchical setup (`provideChildTranslateService()` for feature modules,
`provideTranslateService()` for isolated subtrees), `inject(TranslateService)`
returns the **nearest** service in the chain — not necessarily the root.
v18 exposes `getRoot()` and `getParent()` for navigating the chain when needed.

## When to use these

| Need | API |
| --- | --- |
| Add a translation that all features can see | `getRoot().setTranslation(...)` |
| Read a translation that's only on the root | `getRoot().instant(...)` |
| Walk the chain for debugging | `getParent()` in a loop until `null` |
| Check if you're the root | `service === service.getRoot()` |

`getRoot()` walks the parent chain until it hits an isolation boundary. For an
isolated subtree (a `provideTranslateService()` nested inside another), it
returns the **subtree's** root — not the application-wide root. That's by
design: isolated subtrees should be independent.

## Add a global translation from a feature module

```ts
import { Component, inject } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-feature-toolbar",
    template: `<button (click)="seedShared()">Seed shared keys</button>`,
})
export class FeatureToolbarComponent {
    private translate = inject(TranslateService);

    seedShared(): void {
        // Always lands on the root, regardless of where this component
        // sits in the service hierarchy.
        this.translate.getRoot().setTranslation(
            "en",
            { "shared.copyright": "© 2026 Acme" },
            true, // merge, don't replace
        );
    }
}
```

## Walk the chain for debugging

```ts
import { inject } from "@angular/core";
import { TranslateService, ITranslateService } from "@ngx-translate/core";

let service: ITranslateService | null = inject(TranslateService);
while (service) {
    console.log(
        "layer:",
        service.currentLang(),
        service === service.getRoot() ? "(root)" : "",
    );
    service = service.getParent();
}
```

## Notes

- `getRoot()` is cheap to call repeatedly (O(depth) walk, no caching needed in v18).
- `getParent()` returns `null` at an isolation boundary, even if there's a
  `provideTranslateService()` further up the injector tree.
- If you find yourself reaching for `getRoot()` frequently in business logic,
  consider whether the data belongs on the root in the first place
  (`provideTranslateService()` at the app config) rather than being seeded
  from a child.
