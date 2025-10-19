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
    const router = useRouter();
    const route = useRoute();

    if (!process.client) return;

    const { signallingSocket, transferSocket } = useSignallingSocket();
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