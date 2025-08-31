// plugins/socket.client.js
import { useLoginEvents } from "@/composables/socket/useLoginEvents";
import { useAuth } from "@/composables/useAuth";
import { useLoginStore } from "@/stores/login";
import { useTokenStore } from "@/stores/token";
import { bindSocketEvents } from "@/composables/socket/useSocketListen";
import useSocketEmitEvents from "@/composables/socket/useSocketEmit";
import { useSignallingSocket } from "@/composables/socket/useSignallingSocket";
import { jwtDecode } from "jwt-decode";
import { watchEffect } from "vue";

export default defineNuxtPlugin(async (nuxtApp) => {
    const loginStore = useLoginStore();
    const tokenStore = useTokenStore();
    const { encryptData } = useAuth();
    const route = useRoute();

    // 로그인 페이지 쿼리 파라미터 처리
    if (route.name === "login") {
        const accessToken = route.query.jwt_token;
        const loginType = route.query.login_type;
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

    if (!process.client) return;

    const { signallingSocket, transferSocket } = useSignallingSocket();
    console.log("초기 상태:", signallingSocket.connected, transferSocket.connected);

    signallingSocket.connect();
    transferSocket.connect();

    // signalling socket
    signallingSocket.on("connect", async () => {
        console.log("✅ Signalling Socket Connected:", signallingSocket.id);

        // 이벤트 등록
        bindSocketEvents();
        useSocketEmitEvents();

        // 로그인 이벤트 등록
        const { loginRequest, listenLoginEvent } = useLoginEvents();

        // m_local_deviceid가 준비되면 로그인 요청
        watchEffect(() => {
            if (loginStore.m_local_deviceid && route.name !== "call") {
                loginRequest(loginStore.m_local_deviceid);
                listenLoginEvent();
            }
        });
        
    });

    signallingSocket.on("disconnect", () => {
        console.log("Signalling Socket Disconnected!");
    });
    signallingSocket.on("connect_error", (err) => {
        console.error("Signalling Socket Connect Error:", err.message);
    });

    // transfer socket
    transferSocket.on("connect", () => {
        console.log("✅ Transfer Socket Connected:", transferSocket.id);
    });
    transferSocket.on("disconnect", () => {
        console.log("Transfer Socket Disconnected!");
    });
    transferSocket.on("connect_error", (err) => {
        console.error("Transfer Socket Connect Error:", err.message);
    });

    // 페이지 닫기 시 소켓 종료
    if (!window.__socketUnloadHandlerAdded) {
        window.addEventListener("beforeunload", () => {
            signallingSocket.disconnect();
            transferSocket.disconnect();
        });
        window.__socketUnloadHandlerAdded = true;
    }

    // 토큰 검증
    try {
        if (["dashboard", "meeting", "login"].includes(route.name)) {
            const { $axios } = nuxtApp;
            const res = await $axios.post("homeRest/tokenCheck", {
                jwt: tokenStore.accessToken,
            });

            if (res) {
                loginStore.setTokenResult(0);
                try {
                    const decodedUserInfo = jwtDecode(tokenStore.accessToken);
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

    // 전역 제공
    return {
        provide: {
            signallingSocket,
            transferSocket,
        },
    };
});
