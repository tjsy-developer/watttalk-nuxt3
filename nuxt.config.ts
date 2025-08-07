import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    srcDir: "client/",
    devtools: {
        enabled: true,
    },
    imports: {
        dirs: ["utils"], // 또는 'composables', 'stores', 'utils' 등
    },
    app: {
        baseURL: "/watttalk",
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
                {
                    src: "/js/toastr.min.js",
                    defer: true,
                },
                {
                    src: "/js/spin.min.js",
                    defer: true,
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
    css: ["@/assets/styles/scss/main.scss", "vue-final-modal/style.css"],
    plugins: [
        "@/plugins/axios.client",
        "@/plugins/webrtc-adapter.client",
        "@/plugins/socket.client",
        "@/plugins/janus.client",
        "@/plugins/initPreperence.client",
        "@/plugins/piniaPersist.client",
        "@/plugins/vue-final-modal",
        "@/plugins/i18n",
        "@/plugins/pdfjs.client",
    ],
    modules: [
        "@nuxt/devtools",
        "@pinia/nuxt",
        "pinia-plugin-persistedstate/nuxt",
        [
            "@nuxtjs/color-mode",
            {
                preference: "dark",
                classSuffix: "",
            },
        ],
        // ["@nuxtjs/i18n", require("./i18n.config")],
    ],
    vite: {
        assetsInclude: ["**/*.svg", "**/*.worker.js"],
        optimizeDeps: {
            include: ["quasar"],
        },
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
        server: {
            proxy: {
                "/image-proxy": {
                    target: "https://hdcardev.watttalk.kr",
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/image-proxy/, ""),
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
    devServer: {
        https: {
            key: "../_wildcard.local+3-key.pem", // 생성한 개인 키 파일 경로
            cert: "../_wildcard.local+3.pem", // 생성한 인증서 파일 경로
        },
        // host: "0.0.0.0",
    },
});