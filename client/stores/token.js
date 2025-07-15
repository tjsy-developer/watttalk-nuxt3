// stores/token.ts (suggested filename based on content)
import { defineStore } from "pinia";

export const useTokenStore = defineStore(
    "token",
    {
        state: () => {
            return {
                accessToken: null,
                enRToken: null, // Added type hint for clarity
                tokenState: 0, // 0: 정상; 1: 변조 || 없음; 2: 만료;
                tokenType: 0, // 0: default. 1: call
                requestToken: false,
                decodeState: true,
            }
        },
        actions: {
            setAccessToken(payload) {
                // Added type hint
                this.accessToken = payload;
            },
            setRToken(payload) {
                // Added type hint
                this.enRToken = payload;
            },
            setTokenType(payload) {
                // Added type hint
                this.tokenType = payload;
            },
            initToken() {
                this.enRToken = null;
                this.tokenState = 0;
                this.tokenType = 0;
            },
            setRequestToken(params) {
                // Added type hint
                this.requestToken = params;
            },
            setTokenDecodeState(params) {
                // Added type hint
                this.decodeState = params;
            },
        },
        persist: {
            storage: process.client ? window.sessionStorage : undefined,
        },
    }
);
