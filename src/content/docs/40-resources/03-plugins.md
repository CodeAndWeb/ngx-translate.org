---
title: Plugins
description: Plugins for ngx-translate
slug: resources/plugins
---

Use these plugins to enhance ngx-translate with additional functionality:

## Extraction

* [ngx-translate-extract](https://github.com/vendure-ecommerce/ngx-translate-extract) by @biesbjerg / @vendure: Extract translatable strings from your projects

## Message formatting

* [MessageFormat Compiler](https://github.com/lephyrus/ngx-translate-messageformat-compiler) by @lephyrus: Compiler for ngx-translate that uses messageformat.js to compile translations using ICU syntax for handling pluralization, gender, and more
* [ngx-translate-cut](https://github.com/bartholomej/ngx-translate-cut) by @bartholomej: Simple and useful pipe for cutting translations ✂️

## Development

* [ngx-translate-lint](https://github.com/svoboda-rabstvo/ngx-translate-lint) by @svoboda-rabstvo: Simple CLI tools for check ngx-translate keys in whole app

## Loader

* [browser.i18n Loader](https://github.com/pearnaly/ngx-translate-browser-i18n-loader) by @pearnaly: loader for native translation files of browser extensions.
* [ngx-translate-multi-http-loader](https://github.com/denniske/ngx-translate-multi-http-loader) by @denniske: Fetch multiple translation files with ngx-translate.
* [ngx-translate-module-loader](https://github.com/larscom/ngx-translate-module-loader) by @larscom: Fetch multiple translation files (http) with ngx-translate. Each translation file gets it's own namespace out of the box and the configuration is very flexible.
* [ngx-translate-toolkit](https://github.com/robmanganelly/ngx-translate-toolkit) by @robmanganelly: Extend ngx capabilities with http-based loader or fetch-based loader (does not need HttpClient/Backend). It comes with utils to enforce type safety and modularization of translations in large projects, particularly useful on multi app projects/monorepos. Explore [Documentation](https://robmanganelly.github.io/ngx-translate-toolkit/) in Github pages.

## Routing

* [Localize Router](https://github.com/Greentube/localize-router) by @meeroslav: An implementation of routes localization for Angular. If you need localized urls (for example /fr/page and /en/page).
* [Light Localize Router](https://github.com/elham-oss/light-localize-router) by @elham-oss: localized routes without the need of rewriting your router configuration inspired by localize-routes & angular-l10n routing.
* [ngx-translate-cache](https://github.com/jgpacheco/ngx-translate-cache) by @jgpacheco: Simplified version of localize-router. If you are already using localize-router you don't need this extension. This extension is aimed only to facilitate language caching.

## Testing

* [ngx-translate-testing](https://github.com/mwootendev/ngx-translate-plugins/tree/develop/projects/testing) by @mwootendev: Utilities for unit testing components with translations.

## Obsolete

* ngx-translate-extract-marker - is now included into ngx-translate directly
