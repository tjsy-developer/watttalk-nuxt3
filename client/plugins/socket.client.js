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
    const { encryptData, decodeToken, decryptData, requestNewToken } = useAuth();
    const router = useRouter();
    const route = useRoute();

    if (!process.client) return;

    const { signallingSocket, transferSocket } = useSignallingSocket();
    const { loginRequest, listenLoginEvent, requestEnvironment } = useLoginEvents();
    console.log("초기 상태:", signallingSocket.connected, transferSocket.connected);

    signallingSocket.connect();
    transferSocket.connect();

    // signalling socket
    signallingSocket.on("connect", async () => {
        console.log("✅ Signalling Socket Connected:", signallingSocket.id);

        if (["requestVideoRecording"].includes(route.name)) {
            return;
        }
        // 이벤트 등록
        bindSocketEvents();
        useSocketEmitEvents();
        listenLoginEvent();
    });

    signallingSocket.on("reconnect", async () => {
        console.log("✅ Signalling Socket reConnected:", signallingSocket.id);

        if (["requestVideoRecording"].includes(route.name)) {
            return;
        }
        // 이벤트 등록
        bindSocketEvents();
        useSocketEmitEvents();
        listenLoginEvent();
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

    let lastActivity = Date.now();

    const updateActivity = () => {
        lastActivity = Date.now();
    };

    // DOM 이벤트 기반 활동 감지
    ["keydown", "scroll", "click", "touchstart"].forEach((evt) => {
        window.addEventListener(evt, updateActivity);
    });

    function isTokenExpiring(jwt) {
        try {
            const decoded = jwtDecode(jwt);
            const expireTime = decoded.exp * 1000;
            const now = Date.now();
            return expireTime - now < 2 * 60 * 1000; // 2분 전 만료
        } catch {
            return false;
        }
    }
    setInterval(async () => {

        const { accessToken, enRToken } = tokenStore;

        // 1️⃣ 마지막 활동 시간
        const lastActivityStr = new Date(lastActivity).toLocaleString();

        // 2️⃣ 액세스토큰 만료 시간
        let accessExp = 0;
        let accessTokenExpireStr = "N/A";
        if (accessToken) {
            try {
                const decoded = jwtDecode(accessToken);
                accessExp = decoded.exp * 1000; // exp는 초 단위
                accessTokenExpireStr = new Date(accessExp).toLocaleString();
            } catch {
                accessTokenExpireStr = "Invalid token";
            }
        }

        // 3️⃣ 리프레시토큰 만료 시간 (만약 exp가 있다면)
        let refreshExp = 0;
        let refreshTokenExpireStr = "N/A";
        if (enRToken) {
            try {
                const decodedRefresh = decryptData(enRToken);
                refreshExp = jwtDecode(decodedRefresh);
                refreshTokenExpireStr = new Date(refreshExp.exp * 1000).toLocaleString();
            } catch (err) {
                console.log(err)
                refreshTokenExpireStr = "Invalid token";
            }
        }
        console.log(
            "🕒 마지막 활동시간:",
            lastActivityStr,
            "🔑 액세스토큰 만료시간:",
            accessTokenExpireStr,
            "🔄 리프레시토큰 만료시간:",
            refreshTokenExpireStr,
        );
        const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30분
        const inactive = Date.now() - lastActivity > INACTIVITY_LIMIT;
        console.log(lastActivity > accessExp);

        if (lastActivity > accessExp) {
            // 사용자는 활동 중인데 액세스토큰이 만료된 상태 → 갱신 필요
            await requestNewToken(enRToken);
        } else console.log('아직 만료되지않은 상태')
    }, 5000);

    // 전역 제공
    return {
        provide: {
            signallingSocket,
            transferSocket,
        },
    };
});

function decodeToken(jwt) {
    let result = false;
    try {
        const decodeJwt = jwtDecode(jwt);
        const expireTime = decodeJwt.exp;

        const date = new Date();
        const unixTime = Math.floor(date.getTime() / 1000);

        if (expireTime > unixTime) {
            result = true;
        } else {
            result = "expired";
        }
    } catch {
        console.log("decode fail");
        result = "mutated";
    }

    return result;
}