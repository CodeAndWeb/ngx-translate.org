---
title: FAQ
description: Frequently asked questions.
slug: v16/resources/faq
---

## About the ngx-translate

### Who are you?

I am Andreas Löw, owner of [CodeAndWeb GmbH](https://www.codeandweb.com). We are a small
software company located in the south of Germany in a city called Neu-Ulm.

We develop tools to make a developer's life easier. We started in 2010 with a tool called
[TexturePacker](https://www.codeandweb.com/texturepacker), which we still maintain, support,
and add new features to over this long period of time.

In 2015, we started our first Angular project and wanted to build it as a multilingual
application right from the start. This is how we learned about ngx-translate.
We quickly realized that editing and maintaining multiple JSON translation files becomes
a pain. So we created a tool to help with this:
[BabelEdit](https://www.codeandweb.com/babeledit).

### How is developing for this library financed?

It's easy to start a library like ngx-translate, but maintaining and supporting it
long-term requires time and effort — or, in other words, some form of funding.

For us, this comes from [BabelEdit](https://www.codeandweb.com/babeledit).
You are not required to use it, of course, but we would be happy if you give it a try.
If you like it, get a license, and this also supports the development of this library.

### What's the future of this library?

This is what we currently plan to do:

We'll integrate **bug fixes** and **adjustments to Angular releases** early.

The feature set of the library itself is already quite mature. Our goal is to
keep ngx-translate lean, flexible, and downward compatible. We don't want the
library to become a large, bloated package with functions for even the most absurd
edge-cases.

### Where can I report issues or request new features?

We use the **GitHub bug tracker** to manage all issues, bugs, and feature requests.
If you encounter any problems while using `@ngx-translate/core` or have ideas for
new features, feel free to submit them there.

1. Go to the [GitHub repository](https://github.com/codeandweb/ngx-translate).
2. Open an issue if you've found a bug or suggest an enhancement.
3. Provide as much detail as possible, including steps to reproduce the issue or a clear
   explanation of the feature you would like to see.

We welcome contributions from the community and encourage you to participate in improving
the library. Your feedback helps us make `ngx-translate` better for everyone!

Please read [What's the future of this library?](#whats-the-future-of-this-library) to
understand our plans for the library — especially when it comes to feature requests.

## Licensing

### Which license is used for the library?

Olivier released the original version under [MIT license](https://opensource.org/license/mit) and
we keep it this way
for our changes.

### Is the library free? Even for commercial used?

Yes.

## Technical

### I want to hot reload the translations in my application but `reloadLang` does not work

If you want to reload the translations and see the update on all your components
without reloading the page, you have to load the translations manually and call
[`setTranslation`](/v16/reference/translate-service-api/#settranslation) function, which
triggers [`onTranslationChange`](/v16/reference/translate-service-api/#ontranslationchange-event-emitter).
