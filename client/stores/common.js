// stores/userPreference.ts
import { defineStore } from "pinia";

export const useUserPreferenceStore = defineStore("userPreference", {
    state: () => ({
        lang: "ko",
        theme: "light", // 또는 'dark'
        recordingStatus: false,
        useAutoPictureAccept: false,
        useAutoDiscalling: false,
        useDirectCall: false,
        autoCallAcceptTime: null,
        onlyVoiceCallId: null,
        videoRecording: null,
        roomNumber: null,
    }),
    actions: {
        setLang(payload) {
            this.lang = payload;
        },
        setTheme(payload) {
            this.theme = payload;
        },
        setEnviroment(payload) {
            this.useAutoPictureAccept = payload.useAutoPictureAccept;
            this.useAutoDiscalling = payload.useAutoDiscalling;
            this.useDirectCall = payload.useDirectCall;
            this.autoCallAcceptTime = payload.autoCallAcceptTime;
            this.onlyVoiceCallId = payload.onlyVoiceCallId;
            this.videoRecording = payload.videoRecording;
            this.roomNumber = payload.roomNumber;
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
        storage: process.client ? window.sessionStorage : undefined,
    },
});
