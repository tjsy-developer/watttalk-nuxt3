import { defineNuxtConfig } from 'nuxt/config'
import i18n from './config/i18n.config'

export default defineNuxtConfig({
    ssr: false,
    srcDir: "client/",
    devtools: {
        enabled: false,
    },
    imports: {
        dirs: ["utils", "composables"], // 또는 'composables', 'stores', 'utils' 등
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
                    src: "/js/toastr.min.js",
                    defer: false,
                },
                {
                    type: "module",
                    src: "/js/spin.min.js",
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
    css: ["@/assets/styles/scss/main.scss", "vue-final-modal/style.css"],
    plugins: [
        "@/plugins/piniaPersist.client",
        "@/plugins/axios.client",
        "@/plugins/webrtc-adapter.client",
        "@/plugins/socket.client",
        "@/plugins/janus.client",
        "@/plugins/initPreperence.client",
        "@/plugins/vue-final-modal",
        "@/plugins/pdfjs.client",
    ],
    modules: [
        // "@nuxt/devtools",
        "@pinia/nuxt",
        "pinia-plugin-persistedstate/nuxt",
        ["@nuxtjs/i18n", i18n],
        [
            "@nuxtjs/color-mode",
            {
                preference: "dark",
                classSuffix: "",
            },
        ],
    ],
    vite: {
        esbuild: {
            drop: ["console", "debugger"],
        },
        server: {
            watch: {
                interval: 1000,
                // node_modules, .output, dist 등 불필요한 폴더 제외
                ignored: [
                    "**/node_modules/**",
                    "**/.nuxt/**",
                    "**/.output/**",
                    "**/dist/**",
                ],
            },
        },
        build: {
            sourcemap: false, // 개발 시 소스맵 끄면 조금 빨라짐
        },
        optimizeDeps: {
            include: ["lodash", "moment"], // 미리 변환할 큰 라이브러리
            exclude: ["some-big-cjs-lib"], // 변환 제외
        },
        assetsInclude: ["**/*.svg", "**/*.worker.js"],
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
            NUXT_PUBLIC_JANUS_SERVER_IP: process.env.NUXT_PUBLIC_JANUS_SERVER_IP,
            NUXT_PUBLIC_ICE_SERVER_URL: process.env.ICE_SERVER_URL,
            NUXT_PUBLIC_ICE_SERVER_USER: process.env.ICE_SERVER_USER,
            NUXT_PUBLIC_ICE_SERVER_CREDENTIAL: process.env.ICE_SERVER_CREDENTIAL,
            NUXT_PUBLIC_MANAGER_DOMAIN: process.env.NUXT_PUBLIC_MANAGER_DOMAIN,
            NUXT_PUBLIC_MANAGER_BASE_URL: process.env.NUXT_PUBLIC_MANAGER_BASE_URL,
            NUXT_PUBLIC_SAVE_PHOTO_PATH: process.env.NUXT_PUBLIC_SAVE_PHOTO_PATH,
        },
    }
});