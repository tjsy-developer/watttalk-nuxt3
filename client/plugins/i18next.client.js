// plugins/i18n.ts

import i18next from "i18next";
import ko from "@/assets/jsons/lang/ko.json";
import en from "@/assets/jsons/lang/en.json";
import es from "@/assets/jsons/lang/es.json";
import { useUserPreferenceStore } from "@/stores/common";
import { watch } from "vue";

export default defineNuxtPlugin(() => {
    // Pinia 스토어 인스턴스 가져오기
    // const userPreferenceStore = useUserPreferenceStore();

    // if (!i18next.isInitialized) {
    //     i18next.init({
    //         lng: userPreferenceStore.lang, // Pinia 스토어의 초기 언어 사용
    //         fallbackLng: "en",
    //         debug: process.env.NODE_ENV === "development",
    //         resources: {
    //             en: { translation: en },
    //             ko: { translation: ko },
    //             es: { translation: es },
    //         },
    //     });
    // }

    // return {
    //     provide: {
    //         i18n: i18next,
    //         t: i18next.t.bind(i18next),
    //     },
    // };
});
