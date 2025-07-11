// stores/userPreference.ts
import { defineStore } from "pinia";

export const useUserPreferenceStore = defineStore("userPreference", {
    state: () => ({
        lang: "ko",
        theme: "light", // 또는 'dark'
    }),
    actions: {
        setLang(lang) {
            this.lang = lang;
            localStorage.setItem("lang", lang);
        },
        setTheme(theme) {
            this.theme = theme;
            localStorage.setItem("theme", theme);
        },
        initFromStorage() {
            const lang = localStorage.getItem("lang");
            const theme = localStorage.getItem("theme");
            if (lang) this.lang = lang;
            if (theme) this.theme = theme;
        },
    },
});
