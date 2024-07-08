---
title: Translate Module API
description: A reference page in my new Starlight docs site.
---

### forRoot(config: TranslateModuleConfig)

Use this static method in your application's root module to provide the `TranslateService`.


### forChild(config: TranslateModuleConfig)

Use this static method in your (non-root) modules to import the directive/pipe.

### TranslateModuleConfig

All properties in this configuration object are optional. The configuration can be used for `forRoot()` and `forChild()`.


| Name | Type | Description |
|---|---|---|
| `loader` | `Provider` | Provides a `TranslateLoader` to load translations. |
| `compiler` | `Provider` | Provides a `TranslateCompiler` to prepare translations after loading. The default implementation does nothing.  |
| `parser` | `Provider` | Provides a `TranslateParser` that interpolates parametes in translations. The default implementation checks translations for simple placeholders - e.g. `{{value}}`. |
| `missingTranslationHandler` | `Provider` | Provides a `MissingTranslationHandler` that is invoked if a translation is not found. The default implementation returns the translation key. Also see `userDefaultLang` flag. |
| `isolate` | `boolean` | Isolate the service instance, only works for lazy loaded modules or components with the "providers" property |
| `extend` | `boolean` | Extends translations for a given language instead of ignoring them |
| `useDefaultLang` | `boolean` | Default: `true`. Set the behaviour in case a translation ID is not found. If set to true, the text from the default language is displayed.  If you set it to false, `MissingTranslationHandler` will be used instead of the default language string. |
| `defaultLanguage` | `string` | The default language that is set on startup and is used to provide translations in case a translation is not found in the current language. Also see `userDefaultLang` flag. |
