// composables/useSignallingSocket.ts
import { io, Socket } from "socket.io-client";

let signallingSocket = null;
let transferSocket = null;
export function useSignallingSocket() {
    if (!signallingSocket) {
        signallingSocket = io(useRuntimeConfig().public.NUXT_PUBLIC_SIGNALLING_URL, {
            transports: ["websocket"],
            reconnection: true,
        });
    }

    if (!transferSocket) {
        transferSocket = io(useRuntimeConfig().public.NUXT_PUBLIC_TRANSFER_URL, {
            transports: ["websocket"],
            reconnection: true,
        });
    }
    return { signallingSocket, transferSocket };
}
