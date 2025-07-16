---
title: Write Your Own Parser
description: Learn how to create and register a custom TranslateParser for ngx-translate.
slug: recipes/write-own-parser
---

The `TranslateParser` is responsible for formatting the translated messages and using parameters that are passed in. While the default parser works well for most use cases, you might want to create a custom parser for specific interpolation syntax or advanced formatting needs.

## How to Build a Custom Parser

To implement your own parser, create a class that extends the `TranslateParser` abstract class and implements the `interpolate()` method.

Here's an example of a custom parser that uses `${}` syntax instead of `{{}}`:

```typescript
import { Injectable } from '@angular/core';
import { TranslateParser } from '@ngx-translate/core';

@Injectable()
export class MyCustomParser extends TranslateParser {
  interpolate(expr: string | Function, params?: any): string {
    if (typeof expr === 'string') {
      // Custom interpolation logic using ${} syntax
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

## How to Register a Custom Parser

The recommended approach in v17 is to use the `provideTranslateParser()` function within `provideTranslateService()`:

```ts {2,8} title="app.config.ts"
import {provideTranslateService, provideTranslateParser} from "@ngx-translate/core";
import {MyCustomParser} from './my-custom-parser';

export const appConfig: ApplicationConfig = {
    providers: [
        ...
        provideTranslateService({
            parser: provideTranslateParser(MyCustomParser),
        })
    ],
};
```

For parsers that need dependencies, use the traditional provider approach:

```ts {2-3,9-13} title="app.config.ts"
import {ApplicationConfig} from "@angular/core";
import {provideTranslateService, TranslateParser} from "@ngx-translate/core";
import {MyCustomParser} from './my-custom-parser';

export const appConfig: ApplicationConfig = {
  providers: [
    ...
    provideTranslateService({
      parser: {
        provide: TranslateParser,
        useFactory: () => new MyCustomParser(),
        deps: [],
      }
    })
  ],
};
```

## Usage Example

With the custom parser above, your translation files can use the `${}` syntax:

```json title="en.json"
{
  "HELLO": "Hello ${name}!",
  "WELCOME": "Welcome to ${appName}, ${name}!"
}
```

And in your component:

```typescript
// This will output: "Hello John!"
this.translate.get('HELLO', {name: 'John'}).subscribe((res: string) => {
  console.log(res);
});
```

## When to Use a Custom Parser

Consider creating a custom parser when:

- You need a different interpolation syntax (like `${}` instead of `{{}}`)
- You want to add custom formatting logic
- You need to support legacy translation formats
- You want to add validation or error handling to the interpolation process

For more complex transformations, consider using a [custom compiler](/recipes/custom-compiler-guide/) instead, which can pre-process translations before they reach the parser.