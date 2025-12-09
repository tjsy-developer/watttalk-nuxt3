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
    const { loginRequest, listenLoginEvent, forceLogout } = useLoginEvents();
    console.log("초기 상태:", signallingSocket.connected, transferSocket.connected);

    signallingSocket.connect();
    transferSocket.connect();

    // signalling socket
    signallingSocket.on("connect", async () => {
        console.log("✅ Signalling Socket Connected:", signallingSocket.id);

        if (["requestVideoRecording", "appCheck"].includes(route.name)) {
            alert("여기 아니야?")
            return;
        } else {
            if (loginStore.m_local_deviceid) loginRequest(loginStore.m_local_deviceid);
        }
        // 이벤트 등록
        bindSocketEvents();
        useSocketEmitEvents();
    });

    signallingSocket.on("reconnect", async () => {
        console.log("✅ Signalling Socket reConnected:", signallingSocket.id);

        if (["requestVideoRecording"].includes(route.name)) {
            return;
        }
        // 이벤트 등록
        bindSocketEvents();
        useSocketEmitEvents();
    });

    signallingSocket.on("disconnect", () => {
        console.log("Signalling Socket Disconnected!");
    });
    signallingSocket.on("connect_error", (err) => {
        console.error("Signalling Socket Connect Error:", err.message);
    });

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

    ["keydown", "scroll", "click", "touchstart"].forEach((evt) => {
        window.addEventListener(evt, updateActivity);
    });

    let tokenCheckInterval = null;

    function startTokenCheckInterval() {
        if (tokenCheckInterval !== null) return;

        tokenCheckInterval = window.setInterval(async () => {
            const now = Date.now();
            const { accessToken, enRToken } = tokenStore;

            // 1️⃣ 마지막 활동 시간
            const lastActivityStr = new Date(lastActivity).toLocaleString();

            // 2️⃣ 액세스토큰 만료 시간
            let accessExp = 0;
            let accessTokenExpireStr = "N/A";
            if (accessToken) {
                try {
                    const decoded = jwtDecode(accessToken);
                    accessExp = decoded.exp * 1000;
                    accessTokenExpireStr = new Date(accessExp).toLocaleString();
                } catch {
                    accessTokenExpireStr = "Invalid token";
                }
            }

            // 3️⃣ 리프레시토큰 만료 시간 & 발급 시간
            let refreshExp = 0;
            let refreshIssuedAt = 0;
            let refreshTokenExpireStr = "N/A";
            if (enRToken) {
                try {
                    const decodedRefresh = decryptData(enRToken);
                    const decoded = jwtDecode(decodedRefresh);
                    refreshExp = decoded.exp * 1000;
                    refreshIssuedAt = decoded.iat * 1000;
                    refreshTokenExpireStr = new Date(refreshExp).toLocaleString();
                } catch (err) {
                    console.log(err);
                    refreshTokenExpireStr = "Invalid token";
                }
            }
            // console.log(`토큰 체크:
            // - 현재 시간: ${new Date(now).toLocaleString()}
            // - 마지막 활동: ${lastActivityStr}
            // - 액세스토큰 만료: ${accessTokenExpireStr}
            // - 리프레시토큰 발급시점: ${new Date(refreshIssuedAt).toLocaleString()}
            // `);
            // 4️⃣ 비활동 체크
            const inactive = lastActivity + 5000 < refreshIssuedAt;
            if (inactive && loginStore.m_local_deviceid) {
                console.log("30분 이상 비활동, 로그아웃 처리");
                stopTokenCheckInterval(); // 인터벌 종료
                return;
            }

            // 5️⃣ 액세스토큰 만료 체크
            if (lastActivity > accessExp) {
                try {
                    await requestNewToken();
                } catch (err) {
                    stopTokenCheckInterval();
                    sessionStorage.clear();
                    location.href = getManagerDomain();
                }
            } else {
                // console.log("액세스토큰 아직 유효");
            }
        }, 5000);
    }

    function stopTokenCheckInterval() {
        if (tokenCheckInterval !== null) {
            clearInterval(tokenCheckInterval);
            tokenCheckInterval = null;
        }
    }

    startTokenCheckInterval();

    // 전역 제공
    return {
        provide: {
            signallingSocket,
            transferSocket,
        },
    };
});