---
title: TranslateParser API
description: Reference documentation of the TranslateParser API for ngx-translate.
slug: v15/reference/translate-parser-api
---

The `TranslateParser` is responsible for formatting the translated messages
and using parameters that are passed in.

Usually, you would not use the `TranslateParser` directly. It's called in the
background when a translation string is requested in your app.

It's also most likely that you don't have to create your own parser at all.

## The default parser

The `TranslateParser` service has 2 methods which might sometimes be useful:

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

### getValue

~~~ts
getValue(target: any, key: string): any
~~~

Gets a value from an object by composed key. The `.` is interpreted as sub-object:

Example:

~~~ts
parser.getValue({ key1: { keyA: 'value' }}, 'key1.keyA')
~~~

Returns `value`.

## Custom parser

A `TranslateParser` implements this interface - you can create your
own parser and plug in into the [`TranslateModule`](/v15/reference/translate-module-api) using
the config.

~~~
export abstract class TranslateParser 
{
  abstract interpolate(expr: string | Function, params?: any): string | undefined;
  abstract getValue(target: any, key: string): any
}
~~~
