// plugins/socket.client.ts
import "@/composables/socket/useSocketListen";
import { useLoginEvents } from "@/composables/socket/useLoginEvents";
import { useAuth } from "@/composables/useAuth";
import { useLoginStore } from "@/stores/login";
import { useTokenStore } from "@/stores/token";
import { defineNuxtPlugin, useNuxtApp, useRuntimeConfig } from "nuxt/app";
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

        if (!accessToken || !rToken) {
            console.log("파워매니저로 돌아가세요");
            return;
        }

        const encryptRefreshToken = encryptData(rToken);
        tokenStore.setRToken(encryptRefreshToken);
        tokenStore.setAccessToken(accessToken);
        loginStore.setLoginType(loginType);
        sessionStorage.setItem("isInvited", reservId ? "true" : "false");
    }

    if (process.client) {
        const { signallingSocket, transferSocket } = useSignallingSocket();

        // ✅ 로그인 시 기존 소켓 연결 끊고 새로 연결 (socket.id 갱신)
        if (route.name === "login") {
            console.log(signallingSocket.connected ? signallingSocket.id : '연결안되어있음');
            if (signallingSocket.connected) signallingSocket.disconnect();
            if (transferSocket.connected) transferSocket.disconnect();

            signallingSocket.connect();
            transferSocket.connect();
        }

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
                    if (tokenDecodeResult == 1) {
                        alert("복호화 실패");
                        window.location.href = "http://localhost:8205";
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }

        nuxtApp.provide("signallingSocket", signallingSocket);
        nuxtApp.provide("transferSocket", transferSocket);

        signallingSocket.on("connect", async () => {
            console.log("✅ Signalling Socket Connected:", signallingSocket.id);

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

        signallingSocket.on("disconnect", () =>
            console.log("Signalling Socket Disconnected!"),
        );
        signallingSocket.on("connect_error", (err) =>
            console.error("Signalling Socket Connect Error:", err.message),
        );

        transferSocket.on("connect", () => {
            console.log("✅ Transfer Socket Connected:", transferSocket.id);
        });
        transferSocket.on("disconnect", () =>
            console.log("Transfer Socket Disconnected!"),
        );
        transferSocket.on("connect_error", (err) =>
            console.error("Transfer Socket Connect Error:", err.message),
        );

        window.addEventListener("beforeunload", () => {
            signallingSocket.disconnect();
            transferSocket.disconnect();
        });
    }
});
