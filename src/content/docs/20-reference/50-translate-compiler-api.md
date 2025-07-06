---
title: TranslateCompiler API
description: Reference documentation of the TranslateCompiler API for ngx-translate.
slug: reference/translate-compiler-api
head:
  - tag: link
    attrs:
        rel: canonical
        href: https://ngx-translate.org/reference/translate-compiler-api/
---

## TranslateCompiler API

After a translation file is loaded using the [`TranslateLoader`](/reference/translate-loader-api), it is passed
through the `TranslateCompiler`. The compiler's job is to prepare the translation files for faster
processing later. E.g. the `ngx-translate-messageformat-compiler` plugin makes use of this API to support
ICU formatted messages.

To make use of a `TranslateCompiler`, pass it with the configuration of the  [`TranslateModule`](/reference/configuration).

~~~ts
export abstract class TranslateCompiler {
  abstract compile(value: string, lang: string): string | Function;
  abstract compileTranslations(translations: any, lang: string): any;
}
~~~

* `compile()` is designed to compile a single translation.
* `compileTranslations()` is designed to iterate over all translations of a file using the `compile()` method.

When translating a single message, the [`TranslateParser`](/reference/translate-parser-api) uses the
result of that function to interpolate the result string. You can provide your own `TranslateParser` that works with your custom data.

The default parser works differently, depending on the result of each compiled message.

If the result is a `string`, it replaces all occurrences of a parameter enclosed in curly braces (`{{parameter}}`) with
the parameter value.

If the result is a `Function`, it calls the function with the given translation parameters. The function is expected to
accept an object and return a string:

~~~ts
{
  "hello" = (params) => `Hello ${params.name}!`
}
~~~
