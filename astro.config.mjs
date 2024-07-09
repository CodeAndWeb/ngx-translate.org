import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
    site: 'https://ngx-translate.org',
    integrations: [starlight({
        title: 'ngx-translate',
        plugins: [starlightLinksValidator()],
        logo: {
            src: "./src/assets/ngx-translate.svg"
        },
        social: {
            github: 'https://github.com/ngx-translate/core'
        },
        customCss: [
            // Path to your Tailwind base styles:
            './src/tailwind.css',
        ],
        sidebar: [
            {
                label: 'Getting started',
                autogenerate: {
                    directory: '01-getting-started'
                }
            },
            {
                label: 'Reference',
                autogenerate: {
                    directory: '02-reference'
                }
            },
            {
                label: 'Recipes',
                autogenerate: {
                    directory: '03-recipes'
                }
            },
            {
                label: 'Resources',
                autogenerate: {
                    directory: '04-resources'
                }
            }]
    }), tailwind({
        // Disable the default base styles:
        applyBaseStyles: false,
    })]
});