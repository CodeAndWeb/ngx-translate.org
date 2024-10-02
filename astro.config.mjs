import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import {rehypeHeadingIds} from '@astrojs/markdown-remark';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import matomo from 'astro-matomo';
import rehypeMermaid from 'rehype-mermaid'
import starlightVersions from "starlight-versions";

//import markdown from "astro/dist/vite-plugin-markdown/index.js";

// https://astro.build/config
export default defineConfig({
    site: 'https://ngx-translate.org',
    trailingSlash: 'never',
    markdown: {
        rehypePlugins: [
            rehypeHeadingIds,
            rehypeMermaid,
            [rehypeAutolinkHeadings, {
            // Wrap the heading text in a link.
            behavior: 'wrap'
        }]]
    },
    redirects: {
      //  '/': "/getting-started/installation/"
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
            plugins: [
                starlightLinksValidator({
                    exclude: ["/"]
                }),
                starlightVersions({
                    current: {
                        label: "v15"
                    },
                    versions: [
                        {
                            slug: 'v16',
                            label: 'v16-beta',
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
            social: {
                github: 'https://github.com/codeandweb/ngx-translate'
            },
            customCss: [
                // Path to your Tailwind base styles:
                './src/tailwind.css'],
            sidebar: [{
                label: 'Start here',
                items: [
                    {
                        label: "Getting started",
                        link: "/"
                    },
                    {
                        label: "Installation",
                        link: "/getting-started/installation"
                    },
                    {
                        label: "Translation files",
                        link: "/getting-started/translation-files"
                    },
                    {
                        label: "Translating your components",
                        link: "/getting-started/translating-your-components"
                    }
                ]
            }, {
                label: 'Reference',
                items: [
                    {
                        label: "Concepts",
                        link: "/reference/concepts"
                    },
                    {
                        label: "TranslateModule API",
                        link: "/reference/translate-module-api"
                    },
                    {
                        label: "TranslateService API",
                        link: "/reference/translate-service-api"
                    },
                    {
                        label: "TranslateLoader API",
                        link: "/reference/translate-loader-api"
                    },
                    {
                        label: "TranslateCompiler API",
                        link: "/reference/translate-compiler-api"
                    },
                    {
                        label: "TranslateParser API",
                        link: "/reference/translate-parser-api"
                    },
                    {
                        label: "MissingTranslationHandler API",
                        link: "/reference/missing-translation-handler-api"
                    },
                ]
            }, {
                label: 'Recipes',
                autogenerate: {
                    directory: '04-recipes'
                }
            }, {
                label: 'Resources',
                autogenerate: {
                    directory: '05-resources'
                }
            }]
        }),
        tailwind({
            // Disable the default base styles:
            applyBaseStyles: false
        })
    ]
})
;