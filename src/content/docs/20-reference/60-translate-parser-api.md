---
title: TranslateParser API
description: Reference documentation of the TranslateParser API for ngx-translate.
slug: reference/translate-parser-api
---

The `TranslateParser` is responsible for formatting the translated messages
and using parameters that are passed in.

Usually, you would not use the `TranslateParser` directly. It's called in the
background when a translation string is requested in your app.

It's also most likely that you don't have to create your own parser at all.

## The default parser

### interpolate

~~~ts
interpolate(expr: string | Function, params?: any): string
~~~

Interpolates a string to replace parameters or calls the interpolation function with the parameters.

Example:

~~~ts
parser.interpolate('This is a {{key}}!', {key: 'banana'})
~~~

Returns `This is a banana!`

Example:

~~~ts
parser.interpolate((params) => `This is a ${params.key}`, {key: 'banana'})
~~~

Returns `This is a banana!`


## Custom parser

A `TranslateParser` implements this interface - you can create your
own parser and configure it using the new provider functions or the traditional module configuration.

If you are not using a [compiler](/reference/translate-compiler-api/), you can expect `expr` to be a `string`.

The `TranslateParser` is called every time a translation is requested with a given set of interpolation parameters.
If parsing these messages is too complex, we recommend using a compiler to pre-process the messages.


```typescript
export abstract class TranslateParser {
  abstract interpolate(expr: string | Function, params?: any): string | undefined;
}
```

### Using Provider Functions (Recommended for v17)

```typescript
import { provideTranslateParser } from '@ngx-translate/core';
import { MyCustomParser } from './my-custom-parser';

// In your bootstrap or component providers
provideTranslateParser(MyCustomParser)
```

### Using TranslateModule Configuration

```typescript
import { TranslateModule, TranslateParser } from '@ngx-translate/core';
import { MyCustomParser } from './my-custom-parser';

TranslateModule.forRoot({
  parser: {
    provide: TranslateParser,
    useClass: MyCustomParser
  }
})
```

### Example Custom Parser

```typescript
import { Injectable } from '@angular/core';
import { TranslateParser } from '@ngx-translate/core';

@Injectable()
export class MyCustomParser extends TranslateParser {
  interpolate(expr: string | Function, params?: any): string {
    if (typeof expr === 'string') {
      // Custom interpolation logic
      return expr.replace(/\$\{([^}]+)\}/g, (match, key) => {
        return params && params[key] !== undefined ? params[key] : match;
      });
    } else if (typeof expr === 'function') {
      return expr(params);
    }
    return expr;
  }
}
```
