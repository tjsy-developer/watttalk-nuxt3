import i18next from "i18next";
import ko from "@/assets/jsons/lang/ko.json"
import en from "@/assets/jsons/lang/ko.json";
export default defineNuxtPlugin(() => {
    if (!i18next.isInitialized) {
        i18next.init({
            lng: "ko", // 기본 언어
            fallbackLng: "en",
            debug: process.env.NODE_ENV === "development",
            resources: {
                en: {
                    translation: en,
                },
                ko: {
                    translation: ko,
                },
            },
        });
    }

    return {
        provide: {
            i18n: i18next,
            t: i18next.t.bind(i18next)
        },
    };
});
