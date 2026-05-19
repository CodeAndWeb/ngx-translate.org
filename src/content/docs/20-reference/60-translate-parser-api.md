---
title: TranslateParser API
description: Reference documentation of the TranslateParser API for ngx-translate v18.
slug: reference/translate-parser-api
---

The `TranslateParser` is responsible for interpolating translated messages
with the parameters you pass in. You usually do not call it directly — it runs
in the background each time a translation is requested.

The matching provider helper is `provideTranslateParser()` — see
[Configuration → Provider helpers](/reference/configuration/#provider-helpers).

## API

```typescript
export abstract class TranslateParser {
  abstract interpolate(expr: string | Function, params?: any): string | undefined;
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
