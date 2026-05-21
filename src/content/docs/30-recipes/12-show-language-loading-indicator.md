---
title: How to show a loading indicator during language switch
description: Drive a spinner from TranslateService.isLoading while use() or setFallbackLang() fetches a new language.
slug: recipes/show-language-loading-indicator
---

When the user picks a new language, `TranslateService.use()` triggers an
asynchronous load through the configured `TranslateLoader`. On a slow
connection that can take a noticeable moment. `isLoading` is a reactive
`Signal<boolean>` designed exactly for this case — read it in a template
to drive a spinner or "switching..." indicator while the load is in flight.

If you're looking to prevent UI glitches on **app startup** (before any
language is loaded yet), see
[How to fix UI glitches during translation loading](/recipes/fix-translation-loading-glitches/)
instead. This recipe covers language switches *after* the app is running.

## Recipe

```typescript title="app.component.ts"
import { Component, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [TranslatePipe],
  template: `
    @if (translate.isLoading()) {
      <div class="lang-switch-overlay">
        <span>{{ 'COMMON.SWITCHING_LANGUAGE' | translate }}</span>
      </div>
    }

    <button (click)="switchTo('de')">Deutsch</button>
    <button (click)="switchTo('en')">English</button>
  `,
})
export class AppComponent {
  readonly translate = inject(TranslateService);

  switchTo(lang: string): void {
    this.translate.use(lang).subscribe();
  }
}
```

The signal flips `true` the moment `use()` is called and back to `false` once
the loader completes (or errors). No manual `subscribe()`-based state tracking
is needed.

## Hierarchical scope

`isLoading` uses **downward inheritance**:

- A load triggered at the **root** marks the root and **all descendants**
  as loading. App-shell spinners (component at root) cover language switches
  initiated anywhere in the tree.
- A load triggered at a **child** (e.g. a lazy-loaded feature route fetching
  its own translations) marks **only that child's subtree**. Siblings and
  ancestors are unaffected.

Inject `TranslateService` at the scope where the spinner should live:

```typescript title="feature.component.ts"
// Only spins when THIS lazy-loaded feature's translations are loading.
@Component({
  selector: 'app-feature',
  template: `
    @if (translate.isLoading()) {
      <app-local-spinner />
    }
    ...
  `,
})
export class FeatureComponent {
  readonly translate = inject(TranslateService); // child service from provideChildTranslateService()
}
```

Sibling subtrees that finished loading earlier do **not** flip back to
loading when another subtree starts a new load.

## See also

- [`TranslateService.isLoading`](/reference/translate-service-api/#isloading) — API reference
- [Hierarchical Services](/reference/concepts/#hierarchical-services) — how parent/child translation chains work
- [How to fix UI glitches during translation loading](/recipes/fix-translation-loading-glitches/) — startup glitches (different problem)
