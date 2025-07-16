---
title: Custom Translation Compiler
description: Learn how to create a simple custom compiler for markdown processing in ngx-translate.
slug: recipes/custom-compiler-guide
---

Translation compilers in ngx-translate let you transform your translation text before it's displayed to users. This guide shows you how to create a simple compiler that converts markdown formatting (like **bold** text) into HTML.

## What Are Translation Compilers?

By default, ngx-translate displays your translation text exactly as written in your JSON files. But sometimes you want to add formatting or transform the text in some way. That's where compilers come in.

A [`TranslateCompiler`](/reference/translate-compiler-api/) processes your translations once when they're loaded, converting them into a format that's ready to use. This is more efficient than processing the text every time it's displayed.

Every compiler needs to implement two methods:

* `compile(value: string, lang: string): string | Function` - Transforms a single translation text
* `compileTranslations(translations: any, lang: string): any` - Transforms all translations in a file

## Creating a Markdown Compiler

Let's build a compiler that converts common markdown formatting into HTML. This will let you write `**bold**` and `*italic*` text in your translation files, and have them automatically converted to proper HTML tags.

```typescript
import { Injectable } from '@angular/core';
import { TranslateCompiler } from '@ngx-translate/core';

@Injectable()
export class MarkdownCompiler extends TranslateCompiler {
  compile(value: string, lang: string): string {
    if (typeof value !== 'string') {
      return value;
    }
    
    // Convert markdown syntax to HTML
    return value
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold** → <strong>bold</strong>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')              // *italic* → <em>italic</em>
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>'); // [text](url) → <a href="url">text</a>
  }

  compileTranslations(translations: any, lang: string): any {
    const compiled: any = {};
    
    for (const key in translations) {
      if (translations.hasOwnProperty(key)) {
        const value = translations[key];
        if (typeof value === 'object' && value !== null) {
          // Handle nested translation objects
          compiled[key] = this.compileTranslations(value, lang);
        } else {
          compiled[key] = this.compile(value, lang);
        }
      }
    }
    
    return compiled;
  }
}
```

The `compile` method handles individual translation strings. It uses regular expressions to find markdown patterns and replace them with HTML tags. The `compileTranslations` method processes entire translation files, including nested objects, by calling `compile` on each string value.

## Setting Up Your Compiler

Configure your custom compiler using `provideTranslateCompiler()`:

```typescript title="app.config.ts"
import { bootstrapApplication } from '@angular/platform-browser';
import { provideTranslateService, provideTranslateCompiler } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppComponent } from './app/app.component';
import { MarkdownCompiler } from './app/markdown-compiler';

bootstrapApplication(AppComponent, {
  providers: [
    provideTranslateService({
      loader: provideTranslateHttpLoader(),
      compiler: provideTranslateCompiler(MarkdownCompiler),
      fallbackLang: 'en'
    })
  ]
});
```

## Using Your Markdown Compiler

Once your compiler is set up, you can write markdown formatting directly in your translation files:

```json title="en.json"
{
  "welcome": "**Welcome** to our *amazing* application!",
  "contact": "Need help? [Contact us](mailto:support@example.com)",
  "nested": {
    "message": "This text has **bold** and *italic* formatting"
  }
}
```

Use these translations in your components:

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-example',
  template: `
    <p [innerHTML]="'welcome' | translate"></p>
    <p [innerHTML]="'contact' | translate"></p>
    <p [innerHTML]="'nested.message' | translate"></p>
  `
})
export class ExampleComponent {}
```

Your compiler automatically transforms the markdown into HTML:
- `**Welcome**` becomes `<strong>Welcome</strong>` (bold text)
- `*amazing*` becomes `<em>amazing</em>` (italic text)  
- `[Contact us](mailto:support@example.com)` becomes `<a href="mailto:support@example.com">Contact us</a>` (clickable link)

## When Should You Use a Custom Compiler?

Custom compilers are helpful when you want to:

- **Add formatting to translations** - Convert markdown, BBCode, or other markup to HTML
- **Keep formatting consistent** - Apply the same styling rules across all your translations
- **Improve performance** - Process complex transformations once instead of every time text is displayed
- **Use external libraries** - Integrate with formatting or templating tools

## Things to Remember

- **One-time processing** - Your compiler runs once when translations load, not every time they're displayed
- **Use innerHTML for HTML** - When your compiler outputs HTML, use `[innerHTML]` binding in your templates
- **Test thoroughly** - Make sure your compiler handles edge cases and different input formats
- **Keep it simple** - Complex compilation logic can be hard to debug and maintain