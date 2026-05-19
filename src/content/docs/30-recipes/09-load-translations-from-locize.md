---
title: How to use ngx-translate with Locize
description: Load translations from Locize and push missing keys back to the CDN, using ngx-translate's standard HTTP loader plus a MissingTranslationHandler.
slug: recipes/load-translations-from-locize
---

[Locize](https://www.locize.com/?from=ngx-translate-docs) is a
translation management system built by the same team that maintains
[i18next](https://www.i18next.com). It hosts translation files on a CDN
and provides an editor, review workflow, and AI translation.
ngx-translate can talk to Locize directly via the standard
`provideTranslateHttpLoader` — no Locize-specific plugin needed.

## Loading translations from the Locize CDN

Locize ships two CDN infrastructures (see
[CDN types: Standard vs. Pro](https://www.locize.com/docs/integration/cdn-types-standard-vs-pro?from=ngx-translate-docs)):

- **Standard CDN** at `https://api.lite.locize.app` — BunnyCDN-backed,
  free for generous monthly download volumes, 1-hour fixed cache,
  public-only downloads. Default for newly created Locize projects.
- **Pro CDN** at `https://api.locize.app` — AWS CloudFront-backed,
  pay-per-use, supports private downloads, custom cache control, and
  published-namespace backups.

Pick the host that matches your project's CDN type. Both serve the same
URL shape: `https://{host}/{projectId}/{version}/{lang}/{namespace}`.
Split it into a `prefix + lang + suffix` for ngx-translate's HTTP loader:

```ts title="app.config.ts"
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

const projectId = '<your locize project id>';
const version = 'latest';
const namespace = 'translation';

// Standard CDN (default for new Locize projects):
const locizeHost = 'https://api.lite.locize.app';
// Pro CDN:  'https://api.locize.app'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: `${locizeHost}/${projectId}/${version}/`,
        suffix: `/${namespace}`,
      }),
      fallbackLang: 'en',
      lang: 'en',
    }),
  ],
};
```

## Pushing missing keys back to Locize from dev

Pair the loader with a `MissingTranslationHandler` that calls
[locizer](https://github.com/locize/locizer)'s `add` method, so any key
your app uses but Locize doesn't yet have is pushed back automatically.
The `cdnType` option (`'standard'` or `'pro'`) tells locizer which CDN
your project lives on. Guard the apiKey on `isDevMode()` so production
builds never carry the write-enabled credential:

```ts title="locize-missing-translation-handler.ts"
import { Injectable, isDevMode } from '@angular/core';
import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
} from '@ngx-translate/core';
import locizer from 'locizer';

locizer.init({
  projectId: '<your locize project id>',
  apiKey: isDevMode() ? '<your dev apiKey>' : undefined,
  version: 'latest',
  cdnType: 'standard', // or 'pro'
});

@Injectable()
export class LocizeMissingTranslationHandler
  implements MissingTranslationHandler
{
  handle(params: MissingTranslationHandlerParams): string {
    locizer.add('translation', params.key, params.key);
    return params.key;
  }
}
```

Register it next to the loader:

```ts title="app.config.ts"
import {
  provideMissingTranslationHandler,
  provideTranslateService,
} from '@ngx-translate/core';
import { LocizeMissingTranslationHandler } from './locize-missing-translation-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    ...
    provideTranslateService({
      loader: provideTranslateHttpLoader({ /* ... */ }),
      missingTranslationHandler: provideMissingTranslationHandler(
        LocizeMissingTranslationHandler,
      ),
      fallbackLang: 'en',
      lang: 'en',
    }),
  ],
};
```

See [How to handle missing translations](/recipes/handle-missing-translations/)
for the general pattern.

## Full example

A complete Angular 21 + ngx-translate v17 app using this setup is at
[github.com/locize/ngx-translate-example](https://github.com/locize/ngx-translate-example).
For the API reference and full URL shapes (auth, query options,
caching), see the
[Locize API docs](https://www.locize.com/docs/integration/api?from=ngx-translate-docs).
