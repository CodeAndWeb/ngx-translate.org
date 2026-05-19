---
title: TranslateCompiler API
description: Reference documentation of the TranslateCompiler API for ngx-translate v18.
slug: reference/translate-compiler-api
---

After translations are loaded by the [`TranslateLoader`](/reference/translate-loader-api/),
they are passed through the `TranslateCompiler`. The compiler prepares each
message for faster lookup at translate time — for example,
`ngx-translate-messageformat-compiler` uses this API to compile ICU
MessageFormat strings into interpolation functions.

The matching provider helper is `provideTranslateCompiler()` — see
[Configuration → Provider helpers](/reference/configuration/#provider-helpers).

## API

~~~ts
export abstract class TranslateCompiler {
  abstract compile(value: string, lang: string): string | Function;
  abstract compileTranslations(translations: any, lang: string): any;
}
~~~

## API Description

* `compile()` compiles a single translation value.
* `compileTranslations()` iterates over a full translation object, calling
  `compile()` on each value.

When a single message is requested, the
[`TranslateParser`](/reference/translate-parser-api/) consumes the compiler's
result. The default parser behaves differently depending on the result type:

* `string` → standard `{{placeholder}}` substitution.
* `Function` → called with the interpolation parameters; expected to return a
  string:

~~~ts
const compiledTranslations = {
  hello: (params: any) => `Hello ${params.name}!`,
};
~~~

If you ship translations that are already in their final interpolator-ready
form (e.g. emitted by a build step), store them with
[`setCompiledTranslation()`](/reference/translate-service-api/#setcompiledtranslation)
to bypass the compiler.

## Registering a Custom Compiler

~~~ts title="app.config.ts"
import { provideTranslateService, provideTranslateCompiler } from '@ngx-translate/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTranslateService({
      compiler: provideTranslateCompiler(MyCompiler),
    }),
  ],
};
~~~

The factory form is also supported:

~~~ts
provideTranslateService({
  compiler: provideTranslateCompiler(() => new MyCompiler({ icu: true })),
})
~~~

## How to Build a Custom Compiler

For a step-by-step guide see [Custom Translation Compilers](/recipes/custom-compiler-guide/).
