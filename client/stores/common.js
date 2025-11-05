// stores/userPreference.ts
import { defineStore } from "pinia";

export const useUserPreferenceStore = defineStore("userPreference", {
    state: () => ({
        lang: "ko",
        theme: "light", // 또는 'dark'
        recordingStatus: null,
        useAutoPictureAccept: false,
        useAutoDiscalling: false,
        useDirectCall: false,
        autoCallAcceptTime: null,
        onlyVoiceCallId: null,
        videoRecording: null,
        roomNumber: null,
        selectedAudioID: false,
        selectedMicID: false,
        selectedCamID: false,
        selectedCamIndex: -1,
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

            if (this.recordingStatus == null) {
                this.recordingStatus = payload.videoRecording;
            }
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
        setMediaDevices(payload) {
            if (payload.type === 0) {
                console.log(
                    `*** media device mutated type: ${payload.type}, id: ${payload.id}`,
                );
                this.selectedAudioID = payload.id;
                window.localStorage.setItem("selectedAudioID", payload.id);
            } else if (payload.type === 1) {
                console.log(
                    `*** media device mutated type: ${payload.type}, id: ${payload.id}`,
                );
                this.selectedMicID = payload.id;
                window.localStorage.setItem("selectedMicID", payload.id);
            } else if (payload.type === 2) {
                console.log(
                    `*** media device mutated type: ${payload.type}, id: ${payload.index}`,
                );
                this.selectedCamID = payload.id;
                this.selectedCamIndex = payload.index;
                window.localStorage.setItem("selectedCamIndex", payload.index);
            }
        },
    },
    persist: {
        storage: process.client ? window.sessionStorage : undefined,
    },
});
