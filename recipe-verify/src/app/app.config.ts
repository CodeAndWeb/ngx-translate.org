import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
// Force recipe-verify files into the type-check graph
import "./recipes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    
  ]
};
