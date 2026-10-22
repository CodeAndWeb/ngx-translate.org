// Recipe-verify for: reference/configuration/#custom-retry-policies-unreleased
import { ApplicationConfig } from '@angular/core';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import {
  provideChildTranslateService,
  provideTranslateService,
  TranslateRetryConfig,
} from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const retryPolicyConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTranslateService({
      lang: 'en',
      retry: {
        count: 2,
        delay: (_error, retryAttempt) => 250 * 2 ** (retryAttempt - 1),
        shouldRetry: (error) =>
          error instanceof HttpErrorResponse &&
          (error.status === 0 || error.status === 429 || error.status >= 500),
      },
      loader: provideTranslateHttpLoader({ failOnError: true }),
    }),
  ],
};

const fixedPolicy: TranslateRetryConfig = { count: 2, delay: 500 };
export const fixedRetryProviders = [
  provideTranslateService({ retry: fixedPolicy }),
  provideChildTranslateService({ retry: fixedPolicy }),
];
