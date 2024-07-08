---
title: Write & use your own loader
description: some description
---


## Write & use your own loader

If you want to write your own loader, you need to create a class that
implements `TranslateLoader`. The only required method is `getTranslation` that must return an `Observable`. If your loader is synchronous, just use [`Observable.of`](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/of.md) to create an observable from your static value.

#### Example

```ts
class CustomLoader implements TranslateLoader {
    getTranslation(lang: string): Observable<any> {
        return Observable.of({KEY: 'value'});
    }
}
```

Once you've defined your loader, you can provide it in your configuration by adding it to its `providers` property.

```ts
@NgModule({
    imports: [
        BrowserModule,
        TranslateModule.forRoot({
            loader: {provide: TranslateLoader, useClass: CustomLoader}
        })
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
```

