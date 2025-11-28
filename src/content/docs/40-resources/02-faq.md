---
title: ngx-translate FAQ - Frequently Asked Questions
description: Find answers to common questions about ngx-translate, Angular translation, internationalization, migration, licensing, and troubleshooting issues.
slug: resources/faq
---

## About the ngx-translate


### Who are you?

I am Andreas Löw, owner of [CodeAndWeb GmbH](https://www.codeandweb.com). We are a small
software company located in the south of Germany in a city called Neu-Ulm.

We develop tools to make a developer's life easier. We started in 2010 with a tool called
[TexturePacker](https://www.codeandweb.com/texturepacker), which we still maintain, support,
and add new features to over this long period of time.

In 2015, we started our first Angular project and wanted to build it as a multilingual
application right from the start. This is how we learned about ngx-translate.
We quickly realized that editing and maintaining multiple JSON translation files becomes
a pain. So we created a tool to help with this:
[BabelEdit](https://www.codeandweb.com/babeledit).


### How is developing for this library financed?

It's easy to start a library like ngx-translate, but maintaining and supporting it
long-term requires time and effort — or, in other words, some form of funding.

For us, this comes from [BabelEdit](https://www.codeandweb.com/babeledit).
You are not required to use it, of course, but we would be happy if you give it a try.
If you like it, get a license, and this also supports the development of this library.


### What's the future of this library?

This is what we currently plan to do:

We'll integrate **bug fixes** and **adjustments to Angular releases** early.

The feature set of the library itself is already quite mature. Our goal is to
keep ngx-translate lean, flexible, and downward compatible. We don't want the
library to become a large, bloated package with functions for even the most absurd
edge-cases.


### Where can I report issues or request new features?

We use the **GitHub bug tracker** to manage all issues, bugs, and feature requests.
If you encounter any problems while using `@ngx-translate/core` or have ideas for
new features, feel free to submit them there.

1. Go to the [GitHub repository](https://github.com/codeandweb/ngx-translate).
2. Open an issue if you've found a bug or suggest an enhancement.
3. Provide as much detail as possible, including steps to reproduce the issue or a clear
   explanation of the feature you would like to see.

We welcome contributions from the community and encourage you to participate in improving
the library. Your feedback helps us make `ngx-translate` better for everyone!

Please read [What's the future of this library?](#whats-the-future-of-this-library) to
understand our plans for the library &mdash; especially when it comes to feature requests.






## Licensing

### Which license is used for the library?

Olivier released the original version under [MIT license](https://opensource.org/license/mit) and 
we keep it this way
for our changes.


### Is the library free? Even for commercial used?

Yes.








## Migration to v17

### What are the main breaking changes in v17?

The main breaking changes in v17 include:

1. **Provider System**: Complete overhaul with new provider functions like `provideTranslateService()`
2. **Terminology Change**: "Default" language terminology changed to "Fallback" language
3. **Modern Injection**: Components now use `inject()` function instead of constructor injection
4. **Store Architecture**: EventEmitters replaced with Subjects and Observable getters
5. **HTTP Loader**: New configuration-based approach with `provideTranslateHttpLoader()`

See the [Migration Guide](/getting-started/migration-guide/) for detailed information.

### How do I migrate from TranslateModule.forRoot() to the new provider functions?

**v16 (old):**
```typescript
TranslateModule.forRoot({
  loader: {
    provide: TranslateLoader,
    useFactory: (http: HttpClient) => new TranslateHttpLoader(http),
    deps: [HttpClient]
  },
  defaultLanguage: 'en'
})
```

**v17 (new):**
```typescript
provideTranslateService({
  loader: provideTranslateHttpLoader(),
  fallbackLang: 'en'
})
```

### What happened to setDefaultLang() and getDefaultLang()?

These methods have been renamed in v17:
- `setDefaultLang()` → `setFallbackLang()`
- `getDefaultLang()` → `getFallbackLang()`
- `onDefaultLangChange` → `onFallbackLangChange`

The old methods are deprecated but still work with deprecation warnings.

### How do I use the new injection patterns in components?

**v16 (old):**
```typescript
constructor(private translate: TranslateService) {}
```

**v17 (new):**
```typescript
private translate = inject(TranslateService);
```

### Can I still use NgModule configuration in v17?

Yes! The traditional `TranslateModule.forRoot()` configuration still works in v17. The new provider functions are recommended for standalone components, but both approaches are supported.

### How do I configure a custom loader with the new provider system?

**Using provider functions:**
```typescript
provideTranslateService({
  loader: provideTranslateLoader(() => new MyCustomLoader())
})
```

**With dependencies:**
```typescript
provideTranslateService({
  loader: provideTranslateLoader((http: HttpClient) => new MyCustomLoader(http), [HttpClient])
})
```

### What's the difference between RootTranslateServiceConfig and ChildTranslateServiceConfig?

- **RootTranslateServiceConfig**: Used with `provideTranslateService()` for the root service
- **ChildTranslateServiceConfig**: Used with `provideChildTranslateService()` for child/isolated services

Child services have additional options like `isolate` and `extend` for controlling inheritance behavior.

### How do I handle the EventEmitter to Observable changes?

In v17, properties like `onLangChange` are now Observables instead of EventEmitters:

**v16:**
```typescript
this.translate.onLangChange.emit(event);
```

**v17:**
```typescript
// These are now read-only Observables
this.translate.onLangChange.subscribe(event => {
  // Handle language change
});
```

## Technical

### I want to hot reload the translations in my application but `reloadLang` does not work

If you want to reload your translations and see the update on all your components
without reloading the page, you need to load the translations manually and call the
[`setTranslation`](/reference/translate-service-api/#settranslation) function, which
triggers [`onTranslationChange`](/reference/translate-service-api/#ontranslationchange).

### How do I test components with the new provider functions?

**Testing with v17 providers:**
```typescript
TestBed.configureTestingModule({
  providers: [
    provideTranslateService({
      loader: provideTranslateLoader(FakeLoader)
    })
  ]
});
```

**Mock service approach:**
```typescript
const mockTranslateService: Partial<TranslateService> = {
  get: jasmine.createSpy().and.returnValue(of('translated')),
  instant: jasmine.createSpy().and.returnValue('translated')
};

TestBed.configureTestingModule({
  providers: [
    { provide: TranslateService, useValue: mockTranslateService }
  ]
});
```

### Why am I getting deprecation warnings after upgrading to v17?

v17 includes helpful deprecation warnings for methods and properties that have been renamed or changed. These warnings help you identify code that needs updating:

- Update `setDefaultLang()` to `setFallbackLang()`
- Update `getDefaultLang()` to `getFallbackLang()`
- Update `onDefaultLangChange` to `onFallbackLangChange`
- Consider migrating to the new provider functions

The deprecated methods still work but will be removed in a future version.
