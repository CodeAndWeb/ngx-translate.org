---
title: Custom Translation Compiler
description: Learn how to create a simple custom compiler for markdown processing in ngx-translate.
slug: recipes/custom-compiler-guide
---

Translation compilers in ngx-translate transform your translation values when a language is loaded, before any component renders them. This guide shows where the compiler sits in the loading pipeline, how to write a minimal one, and a full example that converts markdown formatting (like **bold** text) into HTML.

## What Are Translation Compilers?

By default, ngx-translate displays your translation text exactly as written in your JSON files. But sometimes you want to add formatting or transform the text in some way. That's where compilers come in.

A [`TranslateCompiler`](/reference/translate-compiler-api/) processes your translations once when they're loaded, converting them into a format that's ready to use. This is more efficient than processing the text every time it's displayed.

Every compiler needs to implement two methods:

* `compile(value: string, lang: Language): string | InterpolateFunction` - Transforms a single translation text
* `compileTranslations(translations: TranslationObject, lang: Language): InterpolatableTranslationObject` - Transforms all translations in a file

The compiler runs at runtime, after the loader has read the file, so your JSON files stay untouched. If you want to transform the files themselves before the app ships, that's a build step, not a compiler.

## Where the Compiler Runs

The compiler is one step between the loader and your templates:

1. The [`TranslateLoader`](/reference/translate-loader-api/) fetches the raw translations for a language (for example `en.json` over HTTP).
2. `compileTranslations()` runs over the whole object, once, and the result is stored.
3. Your components read the compiled values through `get()`, `instant()` or the `translate` pipe.
4. At render time, the [`TranslateParser`](/reference/translate-parser-api/) substitutes `{{ placeholder }}` values, or calls the interpolation function your compiler returned.

`set()` and `setTranslation()` run the compiler too, over the values you pass them. If your translations are already in their final form, use [`setCompiledTranslation()`](/reference/translate-service-api/#setcompiledtranslation) to skip the compile pass entirely. See the [Pre-compile translations recipe](/recipes/precompile-translations/) for a worked example.

## A Minimal Compiler

Here is the smallest useful compiler: it upper-cases every translation string.

```typescript
import { Injectable } from '@angular/core';
import {
    TranslateCompiler,
    Language,
    TranslationObject,
    InterpolatableTranslationObject,
    InterpolateFunction,
} from '@ngx-translate/core';

@Injectable()
export class UpperCaseCompiler extends TranslateCompiler {
  compile(value: string, _lang: Language): string | InterpolateFunction {
    return value.toUpperCase();
  }

  compileTranslations(
    translations: TranslationObject,
    lang: Language,
  ): InterpolatableTranslationObject {
    const compiled: InterpolatableTranslationObject = {};

    for (const [key, value] of Object.entries(translations)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Handle nested translation objects
        compiled[key] = this.compileTranslations(value as TranslationObject, lang);
      } else if (typeof value === 'string') {
        compiled[key] = this.compile(value, lang);
      } else {
        compiled[key] = value;
      }
    }

    return compiled;
  }
}
```

`compile()` receives one string and returns the transformed string. `compileTranslations()` walks the whole translation object, nested objects included, and calls `compile()` on every string value. The walk stays the same across most compilers; the interesting part is what you do in `compile()`.

## Returning an Interpolation Function

`compile()` can also return a function. Do that when your translation syntax has placeholders of its own that you want to substitute at render time, instead of relying on the default `{{ param }}` syntax.

Say you prefer `%placeholder%` in your translation files:

```json title="en.json"
{
  "greeting": "Hello %name%!"
}
```

Your compiler's `compile()` turns each value into a function that receives the interpolation parameters. Only `compile()` changes compared to the minimal compiler above; `compileTranslations()` is the same walk:

```typescript
compile(value: string, _lang: Language): string | InterpolateFunction {
  return (params) => value.replace(/%(\w+)%/g, (_, key) => String(params?.[key] ?? ''));
}
```

At render time, ngx-translate calls that function with the params you pass to the pipe or to `get()`, so `'greeting' | translate: {name: 'World'}` renders `Hello World!`. The same pattern covers expensive parsing: do the heavy work once inside `compile()`, and let the returned function do only the cheap part on every render.

## Creating a Markdown Compiler

Let's build a compiler that converts common markdown formatting into HTML. This will let you write `**bold**` and `*italic*` text in your translation files, and have them automatically converted to proper HTML tags.

```typescript
import { Injectable } from '@angular/core';
import {
    TranslateCompiler,
    Language,
    TranslationObject,
    InterpolatableTranslationObject,
    InterpolateFunction,
} from '@ngx-translate/core';

@Injectable()
export class MarkdownCompiler extends TranslateCompiler {
  compile(value: string, _lang: Language): string | InterpolateFunction {
    if (typeof value !== 'string') {
      return value;
    }

    // Convert markdown syntax to HTML
    return value
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold** → <strong>bold</strong>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')              // *italic* → <em>italic</em>
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>'); // [text](url) → <a href="url">text</a>
  }

  compileTranslations(
    translations: TranslationObject,
    lang: Language,
  ): InterpolatableTranslationObject {
    const compiled: InterpolatableTranslationObject = {};

    for (const [key, value] of Object.entries(translations)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Handle nested translation objects
        compiled[key] = this.compileTranslations(value as TranslationObject, lang);
      } else if (typeof value === 'string') {
        compiled[key] = this.compile(value, lang);
      } else {
        compiled[key] = value;
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

## Ready-Made Compiler: ICU MessageFormat

If you need pluralization or gender rules rather than custom markup, you don't have to write a compiler yourself. [`ngx-translate-messageformat-compiler`](https://github.com/lephyrus/ngx-translate-messageformat-compiler) compiles ICU MessageFormat syntax when a language loads, and it supports the current ngx-translate versions:

```sh
npm install ngx-translate-messageformat-compiler @messageformat/core
```

```typescript title="app.config.ts"
import { bootstrapApplication } from '@angular/platform-browser';
import { provideTranslateService, provideTranslateCompiler } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideTranslateService({
      loader: provideTranslateHttpLoader(),
      compiler: provideTranslateCompiler(() => new TranslateMessageFormatCompiler()),
    })
  ]
});
```

```json title="en.json"
{
  "messages": "You have {count, plural, =0 {no messages} one {one message} other {# messages}}"
}
```

Here `compile()` parses the MessageFormat pattern once per loaded language and returns an interpolation function, and the function resolves `{count}` on every render.

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
