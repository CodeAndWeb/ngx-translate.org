---
title: How to fix UI glitches during translation loading
description: Prevent UI display issues when translations haven't loaded yet by using static imports, loading screens, or custom handlers.
slug: recipes/fix-translation-loading-glitches
---

When starting your application, you might display UI elements before translations are fully loaded. This can cause visual glitches where translation keys are shown instead of actual text, or where the default [`MissingTranslationHandler`](/reference/missing-translation-handler-api/) displays the keys when no translations are found.

This guide presents three different approaches to solve this common issue, each with their own benefits and trade-offs.

## Solution 1: Embed Default Language Statically

The most straightforward approach is to import your default language translations directly into your application bundle. This ensures that your preferred language is always available immediately.

```typescript title="app.config.ts"
import { ApplicationConfig } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTranslateService({
      fallbackLang: 'en'
    })
  ],
};
```

```typescript title="app.component.ts"
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

// Import your default language translations
import defaultTranslations from '../assets/i18n/en.json';

@Component({
  selector: 'app-root',
  template: `
    <h1>{{ 'WELCOME' | translate }}</h1>
    <p>{{ 'DESCRIPTION' | translate }}</p>
  `
})
export class AppComponent implements OnInit {
  constructor(private translate: TranslateService) {}

  ngOnInit() {
    // Set the static translations for immediate availability
    this.translate.setTranslation('en', defaultTranslations);
    
    // Set the default language - translations are already available
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }
}
```

**Benefits:**
- Immediate display of UI in your preferred language
- No loading delays for the default language
- Fallback is always available

**Trade-offs:**
- Increases initial bundle size
- Default language translations are duplicated (in bundle and external file)

## Solution 2: Display Loading Screen and Wait for Translations

This approach shows a loading screen or hides the UI until translations are fully loaded, then displays the complete interface.

```typescript title="app.component.ts"
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <div *ngIf="!translationsLoaded" class="loading-screen">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
    
    <div *ngIf="translationsLoaded" class="main-content">
      <h1>{{ 'WELCOME' | translate }}</h1>
      <p>{{ 'DESCRIPTION' | translate }}</p>
      <!-- Your main application content -->
    </div>
  `,
  styles: [`
    .loading-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class AppComponent implements OnInit {
  translationsLoaded = false;

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    // Set default language and wait for translations to load
    this.translate.setDefaultLang('en');
    
    // Use the language and wait for the observable to resolve
    this.translate.use('en').subscribe({
      next: () => {
        this.translationsLoaded = true;
      },
      error: (error) => {
        console.error('Failed to load translations:', error);
        // You might want to show an error message or fallback
        this.translationsLoaded = true;
      }
    });
  }
}
```

**Benefits:**
- Clean user experience with no flickering or key display
- Works with any language loading strategy
- Clear loading state for users

**Trade-offs:**
- Adds loading time before UI is shown
- Requires additional loading screen implementation
- May feel slower to users

## Solution 3: Custom MissingTranslationHandler for Empty Strings

This approach uses a custom [`MissingTranslationHandler`](/reference/missing-translation-handler-api/) that returns empty strings instead of displaying translation keys, creating a clean but initially empty UI that fills in as translations load.

```typescript title="empty-missing-translation-handler.ts"
import { Injectable } from '@angular/core';
import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

@Injectable()
export class EmptyMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): string {
    // Return empty string instead of the key
    return '';
  }
}
```

```typescript title="app.config.ts"
import { ApplicationConfig } from '@angular/core';
import { provideTranslateService, provideMissingTranslationHandler } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { EmptyMissingTranslationHandler } from './empty-missing-translation-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTranslateService({
      defaultLanguage: 'en',
      missingTranslationHandler: 
        provideMissingTranslationHandler(EmptyMissingTranslationHandler)
    })
  ],
};
```

```typescript title="app.component.ts"
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>{{ 'WELCOME' | translate }}</h1>
    <p>{{ 'DESCRIPTION' | translate }}</p>
    <!-- Content will appear empty initially, then fill in as translations load -->
  `
})
export class AppComponent implements OnInit {
  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }
}
```

**Benefits:**
- No loading screens or bundle size increase
- UI appears immediately without flickering
- Translations fill in smoothly as they load

**Trade-offs:**
- Initial UI appears empty/incomplete
- May be confusing for users if loading takes too long
- Harder to distinguish between missing translations and loading states

## Choosing the Right Approach

The best solution depends on your specific requirements:

- **Use Solution 1** if you want the fastest perceived performance and don't mind a slightly larger bundle size
- **Use Solution 2** if you prefer a polished loading experience and can afford the extra loading time
- **Use Solution 3** if you want a lightweight solution and your translations load quickly

You can also combine approaches - for example, use static imports for critical UI text and loading screens for less important content.