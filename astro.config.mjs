// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import starlightVersions from 'starlight-versions'
import {rehypeHeadingIds} from '@astrojs/markdown-remark';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import sitemap from '@astrojs/sitemap';
import matomo from 'astro-matomo';


import tailwindcss from "@tailwindcss/vite";


//import markdown from "astro/dist/vite-plugin-markdown/index.js";

// https://astro.build/config
export default defineConfig({
  site: 'https://ngx-translate.org',
  trailingSlash: 'ignore',

  markdown: {
      rehypePlugins: [
          rehypeHeadingIds,
          [rehypeAutolinkHeadings, {
          // Wrap the heading text in a link.
          behavior: 'wrap'
      }]]
  },

  redirects: {
//    '/': "/getting-started"
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
          social: [ { icon: 'github', label: 'GitHub', href: 'https://github.com/ngx-translate/core' } ],
            sidebar: [{
              label: 'Start here',
              items: [
                  {
                      label: "Getting started",
                      link: "/"
                  },
                  {
                      label: "Installation",
                      link: "/getting-started/installation/"
                  },
                  {
                      label: "Translation files",
                      link: "/getting-started/translation-files/"
                  },
                  {
                      label: "Translating your components",
                      link: "/getting-started/translating-your-components/"
                  },
                  {
                      label: "Migration guide v15 → v16",
                      link: "/getting-started/migration-guide/"
                  }
              ]
          }, {
              label: 'Reference',
              items: [
                  {
                      label: "Concepts",
                      link: "/reference/concepts/"
                  },
                  {
                      label: "Configuration",
                      link: "/reference/configuration/"
                  },
                  {
                      label: "TranslateService API",
                      link: "/reference/translate-service-api/"
                  },
                  {
                      label: "TranslateLoader API",
                      link: "/reference/translate-loader-api/"
                  },
                  {
                      label: "TranslateCompiler API",
                      link: "/reference/translate-compiler-api/"
                  },
                  {
                      label: "TranslateParser API",
                      link: "/reference/translate-parser-api/"
                  },
                  {
                      label: "MissingTranslationHandler API",
                      link: "/reference/missing-translation-handler-api/"
                  },
              ]
          }, {
              label: 'Recipes',
              autogenerate: {
                  directory: '30-recipes'
              }
          }, {
              label: 'Resources',
              autogenerate: {
                  directory: '40-resources'
              }
          }],
          plugins: [
              starlightLinksValidator({exclude: ["/"] }),
              starlightVersions({
                  current: {
                      label: "v16"
                  },
                  versions: [
                      {
                          slug: 'v15',
                          label: 'v15',
                      },
                  ],
              }),
          ],
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
          editLink: {
              baseUrl: 'https://github.com/CodeAndWeb/ngx-translate.org/edit/main/',
          },
          customCss: ['./src/styles/global.css'],
        
      })
  ],

  vite: {
    plugins: [tailwindcss()],
  },
})
;