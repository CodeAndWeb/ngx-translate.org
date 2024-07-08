---
title: How to handle missing translations
description: blahn
---

You can set up a provider for the `MissingTranslationHandler` in the bootstrap of your application (recommended), or in the `providers` property of a component. It will be called when the requested translation is not available. The only required method is `handle` where you can do whatever you want. If this method returns a value or an observable (that should return a string), then this will be used. Just don't forget that it will be called synchronously from the `instant` method.

You can use `useDefaultLang` to decide whether default language string should be used when there is a missing translation in current language. Default value is true. If you set it to false, `MissingTranslationHandler` will be used instead of the default language string.

#### Example:

Create a Missing Translation Handler

```ts
import {MissingTranslationHandler, MissingTranslationHandlerParams} from '@ngx-translate/core';

export class MyMissingTranslationHandler implements MissingTranslationHandler {
    handle(params: MissingTranslationHandlerParams) {
        return 'some value';
    }
}
```

Setup the Missing Translation Handler in your module import by adding it to the `forRoot` (or `forChild`) configuration.

```ts
@NgModule({
    imports: [
        BrowserModule,
        TranslateModule.forRoot({
            missingTranslationHandler: {provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler},
            useDefaultLang: false
        })
    ],
    providers: [

    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
```


