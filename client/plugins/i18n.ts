// plugins/i18n.ts
import { createI18n } from "vue-i18n";
import { defineNuxtPlugin } from "nuxt/app";

export default defineNuxtPlugin((nuxtApp) => {
    const i18n = createI18n({
        locale: "en",
        fallbackLocale: "en",
        messages: {
            en: { hello: "Hello" },
            ko: { hello: "안녕" },
        },
    });
    nuxtApp.vueApp.use(i18n);
});
