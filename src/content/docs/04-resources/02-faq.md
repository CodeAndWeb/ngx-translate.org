---
title: FAQ
description: Editors
slug: resources/faq
---


#### I want to hot reload the translations in my application but `reloadLang` does not work

If you want to reload the translations and see the update on all your components
without reloading the page, you have to load the translations manually and
call [`setTranslation`](/reference/translate-service-api#settranslation) function 
which triggers [`onTranslationChange`](/reference/translate-service-api#ontranslationchange-event-emitter).
