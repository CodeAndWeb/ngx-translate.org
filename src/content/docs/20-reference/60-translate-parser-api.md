---
title: TranslateParser API
description: Reference documentation of the TranslateParser API for ngx-translate v18.
slug: reference/translate-parser-api
---

The `TranslateParser` is responsible for interpolating translated messages
with the parameters you pass in. You usually do not call it directly; it runs
in the background each time a translation is requested.

The matching provider helper is `provideTranslateParser()`. See
[Configuration → Provider helpers](/reference/configuration/#provider-helpers).

## API

```typescript
export abstract class TranslateParser {
  abstract interpolate(
    expr: InterpolateFunction | string,
    params?: InterpolationParameters,
  ): string | undefined;
}
```

## API Description

The `interpolate()` method takes either a string or a function expression and
optional parameters, and returns the interpolated string.

### Default parser behavior

**With string expressions:**
~~~ts
parser.interpolate('This is a {{key}}!', { key: 'banana' });
// 'This is a banana!'
~~~

**With function expressions:**
~~~ts
parser.interpolate((params) => `This is a ${params.key}`, { key: 'banana' });
// 'This is a banana!'
~~~

If you are not using a [compiler](/reference/translate-compiler-api/), `expr`
is always a `string`.

The parser is invoked on every translation lookup, so keep it lightweight. If
parsing logic is expensive, move it into a compiler that runs once at load
time.

## Registering a Custom Parser

~~~ts title="app.config.ts"
import { provideTranslateService, provideTranslateParser } from '@ngx-translate/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTranslateService({
      parser: provideTranslateParser(MyParser),
    }),
  ],
};
~~~

Factory form (e.g. when the parser needs configuration from `inject()`):

~~~ts
provideTranslateService({
  parser: provideTranslateParser(() => new MyParser({ strict: true })),
})
~~~

## How to Build a Custom Parser

For a complete example see [Write Your Own Parser](/recipes/write-own-parser/).

## Interpolation context

The optional context argument is available since v18.1. Existing two-argument calls continue to work.

```ts
import type {
  InterpolateFunction,
  InterpolationContext,
  InterpolationParameters,
} from '@ngx-translate/core';

export abstract class TranslateParser {
  abstract interpolate(
    expr: InterpolateFunction | string,
    params?: InterpolationParameters,
    context?: InterpolationContext,
  ): string | undefined;
}
```

`InterpolationContext` is exported from `@ngx-translate/core`:

```ts
export interface InterpolationContext {
  key?: string;
  lang?: string;
}
```

| Field | Meaning |
| --- | --- |
| `key` | The key requested from `TranslateService`. When the value is an object or array, all nested values receive this same key, rather than individual leaf paths. |
| `lang` | The language that supplied the translation. This can be the current language, an explicitly requested language, or a fallback language, including a value found in a parent service. |

For example, when German is active but an English fallback supplies `WELCOME`,
the parser receives `{ key: 'WELCOME', lang: 'en' }`. This lets a custom parser
resolve nested translations in the same language as the outer message.
See [Nested translations](/recipes/write-own-parser/#nested-translations).

Context is optional for direct parser calls. A custom service lookup that does
not report its context leaves `lang` undefined. Treat that as an unknown source
language; the current language may differ from the language that supplied the
message. Applications can choose a separate locale for date or number formatting.

### Default parser hooks

`TranslateDefaultParser` forwards context through its protected hooks:

```ts
interpolateString(expr: string, params?: InterpolationParameters, context?: InterpolationContext): string;
interpolateFunction(fn: InterpolateFunction, params?: InterpolationParameters, context?: InterpolationContext): string;
getInterpolationReplacement(params: InterpolationParameters, key: string, context?: InterpolationContext): string | undefined;
formatValue(value: unknown, context?: InterpolationContext): string | undefined;
```

The `key` argument of `getInterpolationReplacement()` names the interpolation
parameter, such as `name` in `{{ name }}`. `context.key` names the translation.
Default string formatting stays the same. Function expressions receive context
as their second argument; see [Compiled functions](/reference/translate-compiler-api/#interpolation-context).

Existing hook overrides keep working. To use context in an override, accept the
optional argument and forward it when calling `super`. Custom implementations of
`interpolate()` should also pass it to function expressions as `expr(params, context)`.

### Service subclass compatibility

If you override the protected `TranslateService.getTextToInterpolate()` method,
forward its optional third argument to preserve context from the default lookup:

```ts
import {
  TranslateService,
  type InterpolatableTranslation,
  type InterpolationContext,
} from '@ngx-translate/core';

export class CustomTranslateService extends TranslateService {
  protected override getTextToInterpolate(
    key: string,
    lang?: string,
    onLookup?: (lookup: {
      translation: InterpolatableTranslation;
      context: InterpolationContext;
    }) => void,
  ): InterpolatableTranslation {
    return super.getTextToInterpolate(key, lang, onLookup);
  }
}
```

For a custom translation source, call `onLookup` with the translation and its
context before returning the translation. Report context for the final value if
you replace a delegated result. The callback is synchronous and optional.

Existing two-argument overrides keep their translation behavior, but their parser
context contains only the requested key when they do not forward the callback.
The service discards reported context if its translation differs from the final
return value. Equal strings cannot establish their source language, so overrides
remain responsible for reporting the correct context.
