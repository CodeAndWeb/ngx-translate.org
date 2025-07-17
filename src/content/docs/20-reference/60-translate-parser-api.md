---
title: TranslateParser API
description: Reference documentation of the TranslateParser API for ngx-translate.
slug: reference/translate-parser-api
---

The `TranslateParser` is responsible for formatting your translated messages
and using parameters that you pass in.

Usually, you would not use the `TranslateParser` directly. It's called in the
background when a translation string is requested in your app.

## API

```typescript
export abstract class TranslateParser {
  abstract interpolate(expr: string | Function, params?: any): string | undefined;
}
```

## API Description

The `interpolate()` method is the core of the parser. It receives either a string or function expression and optional parameters, then returns the interpolated string.

### Default Parser Behavior

The default parser's `interpolate` method works as follows:

**With string expressions:**
~~~ts
parser.interpolate('This is a {{key}}!', {key: 'banana'})
// Returns: "This is a banana!"
~~~

**With function expressions:**
~~~ts
parser.interpolate((params) => `This is a ${params.key}`, {key: 'banana'})
// Returns: "This is a banana!"
~~~

If you are not using a [compiler](/reference/translate-compiler-api/), you can expect `expr` to be a `string`.

The `TranslateParser` is called every time you request a translation with a given set of interpolation parameters.
If parsing these messages is too complex, we recommend using a compiler to pre-process your messages.

## Custom Parser Implementation

To implement your own parser, create a class that extends the `TranslateParser` abstract class and implements the `interpolate()` method.

For a complete example of how to build and register a custom parser, see the [Write Your Own Parser](/recipes/write-own-parser/) recipe.
