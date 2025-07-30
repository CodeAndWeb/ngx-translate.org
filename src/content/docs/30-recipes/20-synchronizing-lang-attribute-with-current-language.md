---
title: Synchronizing HTML lang attribute with current language
description: Learn how to automatically synchronize the HTML lang attribute with ngx-translate language changes for better SEO and accessibility
slug: recipes/synchronize-lang-attribute-with-current-language
---

## Basic Implementation

Here's a complete implementation that handles both initial language setup and language changes:

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
