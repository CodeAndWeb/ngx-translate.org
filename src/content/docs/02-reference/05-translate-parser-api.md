---
title: Translate Parser API
description: A reference page in my new Starlight docs site.
slug: reference/translate-parser-api
---

## TranslateParser API

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


