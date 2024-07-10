import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import matomo from 'astro-matomo';

import playformInline from "@playform/inline";

// https://astro.build/config
export default defineConfig({
  site: 'https://ngx-translate.org',
  trailingSlash: 'never',
  markdown: {
    rehypePlugins: [rehypeHeadingIds, [rehypeAutolinkHeadings, {
      // Wrap the heading text in a link.
      behavior: 'wrap'
    }]]
  },
  integrations: [
    sitemap({
    filter: page => page !== 'https://ngx-translate.org/imprint' && page !== 'https://ngx-translate.org/privacy-notice'
  }),
    matomo({
    enabled: import.meta.env.PROD,
    // Only load in production
    host: "https://analytics.codeandweb.com/",
    setCookieDomain: "*.codeandweb.com",
    siteId: 3,
    heartBeatTimer: 5,
    disableCookies: true,
    debug: false
  }),
    starlight({
    title: 'ngx-translate',
    plugins: [starlightLinksValidator()],
    logo: {
      src: "./src/assets/ngx-translate.svg"
    },
    favicon: "/images/favicon.svg",
    head: [
      // ICO-Favicon als Fallback für Safari hinzufügen
      {
        tag: 'link',
        attrs: {
          rel: 'icon',
          href: "/images/favicon.ico",
          sizes: '32x32',
        },
      },
    ],
    components: {
      PageFrame: "./src/components/PageFrameWithFooter.astro"
    },
    social: {
      github: 'https://github.com/ngx-translate/core'
    },
    customCss: [
    // Path to your Tailwind base styles:
    './src/tailwind.css'],
    sidebar: [{
      label: 'Getting started',
      autogenerate: {
        directory: '01-getting-started'
      }
    }, {
      label: 'Reference',
      autogenerate: {
        directory: '02-reference'
      }
    }, {
      label: 'Recipes',
      autogenerate: {
        directory: '03-recipes'
      }
    }, {
      label: 'Resources',
      autogenerate: {
        directory: '04-resources'
      }
    }]
  }),
    tailwind({
    // Disable the default base styles:
    applyBaseStyles: false
  })
  ]
});