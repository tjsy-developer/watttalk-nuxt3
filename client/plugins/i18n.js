// plugins/i18n.ts
import { createI18n } from "vue-i18n";
import { defineNuxtPlugin } from "nuxt/app";

import ko from "@/assets/jsons/lang/ko";
// import ko from "@/assets/jsons/lang/ko.json";

export default defineNuxtPlugin((nuxtApp) => {
    const i18n = createI18n({
        locale: "ko",
        fallbackLocale: "ko",
        messages: {
            // en: { hello: "Hello" },
            ko: ko,
        },
        debug: false,
    });
    nuxtApp.vueApp.use(i18n);
});
