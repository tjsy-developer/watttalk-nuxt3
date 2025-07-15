// stores/userPreference.ts
import { defineStore } from "pinia";

export const useUserPreferenceStore = defineStore("userPreference", {
    state: () => ({
        lang: "ko",
        theme: "light", // 또는 'dark'
        recordingStatus: false,
        enviroment: {
            useAutoPictureAccept: false,
            useAutoDiscalling: false,
            useDirectCall: false,
            autoCallAcceptTime: null,
            onlyVoiceCallId: null,
            videoRecording: null,
            roomNumber: null,
        },
    }),
    actions: {
        setLang(payload) {
            this.lang = payload;
        },
        setTheme(payload) {
            this.theme = payload;
        },
        setEnviroment(payload) {
            this.enviroment.useAutoPictureAccept = payload.useAutoPictureAccept;
            this.enviroment.useAutoDiscalling = payload.useAutoDiscalling;
            this.enviroment.useDirectCall = payload.useDirectCall;
            this.enviroment.autoCallAcceptTime = payload.autoCallAcceptTime;
            this.enviroment.onlyVoiceCallId = payload.onlyVoiceCallId;
            this.enviroment.videoRecording = payload.videoRecording;
            this.enviroment.roomNumber = payload.roomNumber;
        },
        setRecordingStatus(payload) {
            this.recordingStatus = payload;
        },
        initFromStorage() {
            const lang = localStorage.getItem("lang");
            const theme = localStorage.getItem("theme");
            if (lang) this.lang = lang;
            if (theme) this.theme = theme;
        },
    },
    persist: {
        path: ['lang', 'theme'],
    },
});
