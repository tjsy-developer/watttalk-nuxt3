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

let signallingSocket = null;
let transferSocket = null;

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

        if (!accessToken || !rToken) {
            console.log("파워매니저로 돌아가세요");
            return;
        }

        const encryptRefreshToken = encryptData(rToken);
        tokenStore.setRToken(encryptRefreshToken);
        tokenStore.setAccessToken(accessToken);
        loginStore.setLoginType(loginType);
    }

    if (process.client) {
        const route = useRoute();
        const config = useRuntimeConfig();

        if (
            route.name == "dashboard" ||
            route.name == "meeting" ||
            route.name == "login"
        ) {
            // const { $axios } = useNuxtApp();
            const res = await $fetch("homeRest/tokenCheck", {
                baseURL: "https://hdcardev.watttalk.kr/wattmanager-server",
                method: "POST",
                body: {
                    jwt: tokenStore.accessToken,
                },
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

        signallingSocket = io(config.public.NUXT_PUBLIC_SIGNALLING_URL, {
            transports: ["websocket"], // WebSocket 전송 방식 강제
            reconnection: true,
        });
        transferSocket = io(config.public.NUXT_PUBLIC_TRANSFER_URL, {
            transports: ["websocket"],
            reconnection: true,
        });
        // 선택 사항: 소켓 연결 상태 로깅 (디버깅용)
        signallingSocket.on("connect", async () => {
            if (!nuxtApp.vueApp.config.globalProperties.$signallingSocket) {
                nuxtApp.provide("signallingSocket", signallingSocket);
                console.log("signallingSocket provided.");
            } else {
                console.warn(
                    "signallingSocket is already provided. Skipping re-provision.",
                );
            }

            if (!nuxtApp.vueApp.config.globalProperties.$transferSocket) {
                nuxtApp.provide("transferSocket", transferSocket);
                console.log("transferSocket provided.");
            } else {
                console.warn(
                    "transferSocket is already provided. Skipping re-provision.",
                );
            }
            // ✅ 여기서 이벤트 바인딩 실행
            bindSocketEvents(signallingSocket);
            useSocketEmitEvents(signallingSocket);
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

        transferSocket.on("connect", () => console.log("Transfer Socket Connected!"));
        transferSocket.on("disconnect", () =>
            console.log("Transfer Socket Disconnected!"),
        );
        transferSocket.on("connect_error", (err) =>
            console.error("Transfer Socket Connect Error:", err.message),
        );
    }
});
