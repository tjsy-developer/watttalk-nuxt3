// composables/useSocketInit.ts
import { useLoginEvents } from "@/composables/socket/useLoginEvents";
import { useAuth } from "@/composables/useAuth";
import { useLoginStore } from "@/stores/login";
import { useTokenStore } from "@/stores/token";
import { bindSocketEvents } from "@/composables/socket/useSocketListen";
import useSocketEmitEvents from "@/composables/socket/useSocketEmit";
import { useSignallingSocket } from "@/composables/socket/useSignallingSocket";
import { jwtDecode } from "jwt-decode";
import { useRoute } from "vue-router";
import { useNuxtApp } from "nuxt/app";

export async function useSocketInit() {
    const loginStore = useLoginStore();
    const tokenStore = useTokenStore();
    const { decodeToken, verifyToken, encryptData } = useAuth();
    const route = useRoute();
    const nuxtApp = useNuxtApp();
    // 로그인 페이지에서 쿼리 파라미터 처리
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

    // 클라이언트 사이드에서만 실행
    if (process.client) {
        const { signallingSocket, transferSocket } = useSignallingSocket();

        if (route.name === "login") {
            if (signallingSocket.connected) signallingSocket.disconnect();
            if (transferSocket.connected) transferSocket.disconnect();
            // 로그인 페이지에서는 소켓 연결 보류하거나 다른 로직 적용
        } else {
            if (!signallingSocket.connected) signallingSocket.connect();
            if (!transferSocket.connected) transferSocket.connect();
        }

        // beforeunload 이벤트는 한번만 등록
        if (!window.__socketUnloadHandlerAdded) {
            window.addEventListener("beforeunload", () => {
                signallingSocket.disconnect();
                transferSocket.disconnect();
            });
            window.__socketUnloadHandlerAdded = true;
        }

        try {
            if (
                route.name === "dashboard" ||
                route.name === "meeting" ||
                route.name === "login"
            ) {
                const { $axios } = nuxtApp;
                const res = await $axios.post("homeRest/tokenCheck", {
                    jwt: tokenStore.accessToken,
                });
                if (res) {
                    loginStore.setTokenResult(0);
                    try {
                        const decodedUserInfo = jwtDecode(tokenStore.accessToken);
                        console.log(loginStore);
                        await loginStore.setTokenInfo(decodedUserInfo);
                    } catch {
                        alert("복호화 실패");
                        window.location.href = "http://localhost:8205";
                        return;
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }

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

            // const result = await verifyToken(tokenStore.accessToken);
            // console.log("verify token", result);
            // if (!result) return false;

            // if (loginStore.loginType == 1) {

            // }

            loginRequest(loginStore.m_local_deviceid);
            listenLoginEvent();
            listenForceLogoutEvent();
            listenEviroment();
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
}
