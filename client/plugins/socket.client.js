// plugins/socket.client.ts
import "@/composables/socket/useSocketListen";
import { useLoginEvents } from "@/composables/socket/useLoginEvents";
import { useAuth } from "@/composables/useAuth";
import { useLoginStore } from "@/stores/login";
import { useTokenStore } from "@/stores/token";
import { defineNuxtPlugin, useNuxtApp, useRuntimeConfig } from "nuxt/app";
import { io } from "socket.io-client";
import { bindSocketEvents } from "@/composables/socket/useSocketListen";
import useSocketEmitEvents from "@/composables/socket/useSocketEmit";
import { useRoute } from "vue-router";
import { useSignallingSocket } from "@/composables/socket/useSignallingSocket";

export default defineNuxtPlugin(async (nuxtApp) => {
    const loginStore = useLoginStore();
    const tokenStore = useTokenStore();
    const { decodeToken, verifyToken, encryptData } = useAuth();
    
    const route = useRoute();
    if (route.name === "login") {
        const accessToken = route.query.jwt_token;
        const loginType = route.query.login_type;
        const lang = route.query.lang;
        const rToken = route.query.rToken;
        const reservId = route.query.reservId;
        alert(reservId);
        if (!accessToken || !rToken) {
            console.log("파워매니저로 돌아가세요");
            return;
        }
        
        const encryptRefreshToken = encryptData(rToken);
        tokenStore.setRToken(encryptRefreshToken);
        tokenStore.setAccessToken(accessToken);
        loginStore.setLoginType(loginType);
        sessionStorage.setItem("isInvited", reservId ? true : false);
    }

    if (process.client) {
        const { signallingSocket, transferSocket } = useSignallingSocket();

        const route = useRoute();
        const config = useRuntimeConfig();
        
        try {
            if (
                route.name == "dashboard" ||
                route.name == "meeting" ||
                route.name == "login"
            ) {
                const { $axios } = useNuxtApp();
                const res = await $axios.post("homeRest/tokenCheck", {
                    jwt: tokenStore.accessToken,
                });

                if (res) {
                    loginStore.setTokenResult(0);
                    loginStore.decodeToken(tokenStore.accessToken);
                    const tokenDecodeResult = loginStore.tokenDecodeResult;
                    // 복호화 실패일 경우
                    if (tokenDecodeResult == 1) {
                        alert("복호화 실패");
                        window.location.href = "http://localhost:8205";
                    }
                }
            }
        } catch (err) {
            console.log(err)
        }
        
        nuxtApp.provide("signallingSocket", signallingSocket);
        nuxtApp.provide("transferSocket", transferSocket);
        // 선택 사항: 소켓 연결 상태 로깅 (디버깅용)
        signallingSocket.on("connect", async () => {
            if (!nuxtApp.vueApp.config.globalProperties.$signallingSocket) {
                
                console.log("signallingSocket provided.");
            } else {
                console.warn(
                    "signallingSocket is already provided. Skipping re-provision.",
                );
            }
            // // ✅ 여기서 이벤트 바인딩 실행
            bindSocketEvents();
            useSocketEmitEvents();
            const {
                loginRequest,
                listenLoginEvent,
                listenForceLogoutEvent,
                listenEviroment,
            } = useLoginEvents();
            const result = await verifyToken(tokenStore.accessToken);
            console.log("verify token", result);
            if (!result) return false;

            if (loginStore.loginType == 1) {
                loginRequest(loginStore.m_local_deviceid);
                listenLoginEvent();
                listenForceLogoutEvent();
                listenEviroment();
            }
        });
        signallingSocket.on(
            "disconnect",
            () => console.log("Signalling Socket Disconnected!"),
            1,
        );
        signallingSocket.on("connect_error", (err) =>
            console.error("Signalling Socket Connect Error:", err.message),
        );

        transferSocket.on("connect", () => {
            console.log("Transfer Socket Connected!")
            if (!nuxtApp.vueApp.config.globalProperties.$transferSocket) {
                console.log("transferSocket provided.");
            } else {
                console.warn(
                    "transferSocket is already provided. Skipping re-provision.",
                );
            }
        });
        transferSocket.on("disconnect", () =>
            console.log("Transfer Socket Disconnected!"),
        );
        transferSocket.on("connect_error", (err) =>
            console.error("Transfer Socket Connect Error:", err.message),
        );
    }
});
