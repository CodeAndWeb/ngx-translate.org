---
title: How to use a compiler to preprocess translation values
description: Use a TranslationCompiler to pre-process translation files after
  loading for ngx-translate
slug: recipes/preprocess-translations
---

By default, translation values are added "as-is". You can configure a `compiler` that
implements `TranslateCompiler` to pre-process translation values when they are
added (either manually or by a loader). A compiler has the following methods:

* `compile(value: string, lang: string): string | Function`: Compiles a string to a function or another string.
* `compileTranslations(translations: any, lang: string): any`: Compiles a (possibly nested) object of translation values to a structurally identical object of compiled translation values.

Using a compiler opens the door for powerful pre-processing of translation values.
As long as the compiler outputs a compatible interpolation string or an interpolation
function, arbitrary input syntax can be supported.

## Example

### Create a Custom Compiler

```typescript
import { Injectable } from '@angular/core';
import { TranslateCompiler } from '@ngx-translate/core';

@Injectable()
export class CustomTranslateCompiler implements TranslateCompiler {
    compile(value: string, lang: string): string | Function {
        // Example: Convert markdown-style bold text to HTML
        if (typeof value === 'string') {
            return value.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        }
        return value;
    }

    compileTranslations(translations: any, lang: string): any {
        // Recursively compile all translation values
        const compiledTranslations: any = {};
        
        for (const key in translations) {
            if (translations.hasOwnProperty(key)) {
                const value = translations[key];
                if (typeof value === 'string') {
                    compiledTranslations[key] = this.compile(value, lang);
                } else if (typeof value === 'object' && value !== null) {
                    compiledTranslations[key] = this.compileTranslations(value, lang);
                } else {
                    compiledTranslations[key] = value;
                }
            }
        }
        
        return compiledTranslations;
    }
}
```

### Setup with Standalone Components (Recommended)

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideTranslateService, provideTranslateCompiler } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppComponent } from './app/app.component';
import { CustomTranslateCompiler } from './app/custom-translate-compiler';

bootstrapApplication(AppComponent, {
  providers: [
    provideTranslateService({
      loader: provideTranslateHttpLoader(),
      fallbackLang: 'en'
    }),
    provideTranslateCompiler(CustomTranslateCompiler)
  ]
});
```

### Setup with NgModule

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateCompiler } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppComponent } from './app.component';
import { CustomTranslateCompiler } from './custom-translate-compiler';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new TranslateHttpLoader(http),
        deps: [HttpClient]
      },
      compiler: {
        provide: TranslateCompiler,
        useClass: CustomTranslateCompiler
      },
      fallbackLang: 'en'
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### Advanced Example: Template Compiler

```typescript
import { Injectable } from '@angular/core';
import { TranslateCompiler } from '@ngx-translate/core';

@Injectable()
export class TemplateTranslateCompiler implements TranslateCompiler {
    private templateCache = new Map<string, Function>();

    compile(value: string, lang: string): string | Function {
        if (typeof value !== 'string') {
            return value;
        }

        // Check if value contains template syntax
        if (value.includes('{{') && value.includes('}}')) {
            const cacheKey = `${lang}:${value}`;
            
            if (this.templateCache.has(cacheKey)) {
                return this.templateCache.get(cacheKey)!;
            }

            // Create a template function
            const templateFn = (params: any = {}) => {
                return value.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
                    const trimmedKey = key.trim();
                    return params[trimmedKey] !== undefined ? params[trimmedKey] : match;
                });
            };

            this.templateCache.set(cacheKey, templateFn);
            return templateFn;
        }

        return value;
    }

    compileTranslations(translations: any, lang: string): any {
        const compiled: any = {};
        
        for (const key in translations) {
            if (translations.hasOwnProperty(key)) {
                const value = translations[key];
                if (typeof value === 'object' && value !== null) {
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

### Usage Example

With the template compiler above, you can use translations like:

```json
{
  "welcome": "Hello {{name}}, welcome to {{appName}}!",
  "formatted": "**Bold text** and normal text"
}
```

```typescript
import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-example',
  template: `
    <p>{{ 'welcome' | translate: {name: 'John', appName: 'MyApp'} }}</p>
    <p [innerHTML]="'formatted' | translate"></p>
  `
})
export class ExampleComponent {
  private translate = inject(TranslateService);

  ngOnInit() {
    // Using the service directly
    this.translate.get('welcome', {name: 'John', appName: 'MyApp'})
      .subscribe(translation => console.log(translation));
  }
}
```

### Performance Considerations

When implementing a custom compiler:

1. **Cache compiled results** to avoid recompilation
2. **Handle nested objects** efficiently
3. **Consider memory usage** for large translation files
4. **Test with your specific use case** to ensure performance

### Common Use Cases

- **Markdown processing**: Convert markdown syntax to HTML
- **Template compilation**: Support custom template syntax
- **Pluralization**: Advanced pluralization rules
- **Text formatting**: Apply consistent formatting rules
- **Conditional content**: Show/hide content based on conditions
