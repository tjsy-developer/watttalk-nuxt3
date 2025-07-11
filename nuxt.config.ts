import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    srcDir: "client/",
    devtools: {
        enabled: true,
    },
    app: {
        head: {
            title: process.env.NUXT_PUBLIC_HEAD_TITLE,
            meta: [
                {
                    charset: "utf-8",
                },
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1",
                },
                {
                    name: "description",
                    content: process.env.npm_package_description || "",
                },
            ],
            script: [
                {
                    type: "module",
                    src: "/js/janus.js",
                    defer: false,
                },
            ],
            link: [
                {
                    rel: "icon",
                    type: "image/png",
                    href: process.env.NUXT_PUBLIC_FAVICON_PATH,
                },
            ],
        },
    },
    css: ["@/assets/styles/scss/main.scss"],
    plugins: [
        "@/plugins/axios.client",
        "@/plugins/socket.client",
        "@/plugins/janus.client",
        "@/plugins/init-preperence.client.ts",
        "@/plugins/commonFunc",
    ],
    modules: [
        "@nuxt/devtools",
        "@pinia/nuxt",
        [
            "@nuxtjs/color-mode",
            {
                preference: "dark",
                classSuffix: "",
            },
        ],
        ["@nuxtjs/i18n", require("./i18n.config")],
    ],
    vite: {
        assetsInclude: ["**/*.svg"],
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `
                        @use "@/assets/styles/scss/_variables.scss" as *;
                        @use "@/assets/styles/scss/_utils.scss" as *;
                    `,
                },
            },
        },
    },
    runtimeConfig: {
        public: {
            NUXT_PUBLIC_HEAD_TITLE: process.env.NUXT_PUBLIC_HEAD_TITLE,
            NUXT_PUBLIC_FAVICON_PATH: process.env.NUXT_PUBLIC_FAVICON_PATH,
            NUXT_PUBLIC_MAIN_LOGO_PATH: process.env.NUXT_PUBLIC_MAIN_LOGO_PATH,
            NUXT_PUBLIC_SIGNALLING_URL: process.env.NUXT_PUBLIC_SIGNALLING_URL,
            NUXT_PUBLIC_TRANSFER_URL: process.env.NUXT_PUBLIC_TRANSFER_URL,
            NUXT_PUBLIC_SERVER_IP: process.env.NUXT_PUBLIC_SERVER_IP,
            NUXT_PUBLIC_ICE_SERVER_URL: process.env.NUXT_PUBLIC_ICE_SERVER_URL,
        },
    },
});