---
title: Synchronizing HTML lang attribute with current language
description: Learn how to automatically synchronize the HTML lang attribute with ngx-translate language changes for better SEO and accessibility
slug: recipes/synchronize-lang-attribute-with-current-language
---

## Basic Implementation (v18 signal-based, recommended)

In v18, `currentLang` is a `Signal<Language | null>`. An `effect()` reads it once and
re-runs on every language change — no subscription, no `OnDestroy` cleanup:

```typescript title="app.component.ts"
import { Component, effect, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  private translate = inject(TranslateService);

  constructor() {
    effect(() => {
      const lang =
        this.translate.currentLang() ??
        this.translate.fallbackLang() ??
        'en';
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('lang', lang);
      }
    });
  }
}
```

The `effect()` runs once on creation (handling initial state) and re-runs whenever
`currentLang` or `fallbackLang` emit. Angular automatically tears it down when the
component is destroyed.

## Observable-based alternative

If you prefer the Observable API (for example, you're sharing the logic with non-component
code that doesn't have an injection context), subscribe to `onLangChange`:

```typescript title="app.component.ts"
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  private translate = inject(TranslateService);
  private langChangeSubscription?: Subscription;

  ngOnInit(): void {
    // Set initial lang attribute
    this.setHtmlLangAttribute(this.translate.getCurrentLang() || this.translate.getFallbackLang() || "en");

    // Subscribe to language changes
    this.langChangeSubscription = this.translate.onLangChange.subscribe(
      (event: LangChangeEvent) => {
        this.setHtmlLangAttribute(event.lang);
      }
    );
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    this.langChangeSubscription?.unsubscribe();
  }

  private setHtmlLangAttribute(lang: string): void {
    if (lang && typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', lang);
    }
  }
}
```
