---
title: How to use a compiler to preprocess translation values
description: Use a TranslationCompiler to pre-process translation files after
  loading for ngx-translate
slug: recipes/preprocess-translations
head:
  - tag: link
    attrs:
        rel: canonical
        href: https://ngx-translate.org/recipes/preprocess-translations/
---

By default, translation values are added "as-is". You can configure a `compiler` that
implements `TranslateCompiler` to pre-process translation values when they are
added (either manually or by a loader). A compiler has the following methods:

* `compile(value: string, lang: string): string | Function`: Compiles a string to a function or another string.
* `compileTranslations(translations: any, lang: string): any`:  Compiles a (possibly nested) object of translation values to a structurally identical object of compiled translation values.

Using a compiler opens the door for powerful pre-processing of translation values.
As long as the compiler outputs a compatible interpolation string or an interpolation
function, arbitrary input syntax can be supported.
