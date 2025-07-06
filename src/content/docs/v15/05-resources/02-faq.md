---
title: FAQ
description: Frequently asked questions.
slug: v15/resources/faq
---

#### I want to hot reload the translations in my application but `reloadLang` does not work

If you want to reload the translations and see the update on all your components
without reloading the page, you have to load the translations manually and
call [`setTranslation`](/v15/reference/translate-service-api/#settranslation) function
which triggers [`onTranslationChange`](/v15/reference/translate-service-api/#ontranslationchange-event-emitter).
