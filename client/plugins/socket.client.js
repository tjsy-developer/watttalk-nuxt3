// plugins/socket.client.ts

import { useLoginEvents } from "@/composables/socket/useLoginEvents";
import { useAuth } from "@/composables/useAuth";
import { useAuthStore } from "@/stores/login";
import { useTokenStore } from "@/stores/token";
import { defineNuxtPlugin, useNuxtApp, useRuntimeConfig } from "nuxt/app";
import { io } from "socket.io-client";

export default defineNuxtPlugin(async (nuxtApp) => {
    const router = useRouter();
    const loginStore = useAuthStore();
    const tokenStore = useTokenStore();
    const { $transferSocket, $signallingSocket, $axios } = useNuxtApp();
    const { decodeToken, verifyToken, encryptData } = useAuth();

    const route = useRoute();
    if (route.name === "login") {
        const accessToken = route.query.jwt_token;
        const loginType = route.query.login_type;
        const lang = route.query.lang;
        const rToken = route.query.rToken;
        const reservId = route.query.reservId;

        console.log("여기", accessToken, loginType, lang, rToken, reservId);

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
        const config = useRuntimeConfig();
        const res = await $axios.post("/homeRest/tokenCheck", {
            jwt: tokenStore.accessToken,
        });

        if (res.data) {
            loginStore.setTokenResult(0);
            loginStore.decodeToken(tokenStore.accessToken);
            const tokenDecodeResult = loginStore.tokenDecodeResult;
            // 복호화 실패일 경우
            if (tokenDecodeResult == 1) {
                alert("파워매니저로 이동");
            } else {
                alert("정상 토큰");
            }
        } else {
            loginStore.setTokenResult(2);
            alert("파워매니저로 이동");
        }
        const signallingSocket = io(config.public.NUXT_PUBLIC_SIGNALLING_URL, {
            transports: ["websocket"], // WebSocket 전송 방식 강제
            reconnection: true,
        });
        const transferSocket = io(config.public.NUXT_PUBLIC_TRANSFER_URL, {
            transports: ["websocket"],
            reconnection: true,
        });

        nuxtApp.provide("signallingSocket", signallingSocket);
        nuxtApp.provide("transferSocket", transferSocket);
        // 선택 사항: 소켓 연결 상태 로깅 (디버깅용)
        signallingSocket.on("connect", async () => {

            console.log("Signalling Socket Connected!")
            const { loginRequest, listenLoginEvent, listenForceLogoutEvent } =
                useLoginEvents();
            const result = await verifyToken(tokenStore.accessToken);
            console.log('verify token', result)
            if (!result) return false;
    
            if (loginStore.loginType == 1) {
                loginRequest(loginStore.m_local_deviceid);
                listenLoginEvent();
                listenForceLogoutEvent();
            }
        });
        signallingSocket.on("disconnect", () =>
            console.log("Signalling Socket Disconnected!"),1
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
