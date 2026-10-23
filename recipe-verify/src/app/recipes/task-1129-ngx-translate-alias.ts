// Requires the unreleased core branch for issue #1129.
import { Component } from '@angular/core';
import { TranslateDirective } from '@ngx-translate/core';

@Component({
  selector: 'app-ngx-translate-alias-verify',
  standalone: true,
  imports: [TranslateDirective],
  template: `
    <div [ngxTranslate]="'app.hello'" [translateParams]="{ name: 'John' }"></div>
    <div ngxTranslate="app.hello"></div>
  `,
})
export class NgxTranslateAliasComponent {}
