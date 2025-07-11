import { createI18n } from "vue-i18n";

export default createI18n({
    legacy: false, // Composition API 기반
    locale: "ko",
    fallbackLocale: "en",
    modifiers: {
        // 선택 사항: i18n modifiers (e.g., capitalize)
    },
});
