---
title: FAQ
description: Editors
---


#### I want to hot reload the translations in my application but `reloadLang` does not work

If you want to reload the translations and see the update on all your components
without reloading the page, you have to load the translations manually and
call [`setTranslation`](#set-translation) function which triggers [`onTranslationChange`](#on-translation-change).
