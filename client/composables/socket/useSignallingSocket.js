// composables/useSignallingSocket.ts
import { io, Socket } from "socket.io-client";

export function useSignallingSocket() {
    const config = useRuntimeConfig().public;

    if (process.server) return { signallingSocket: null, transferSocket: null }; // SSR 방지

    if (!globalThis.__signallingSocket) {
        globalThis.__signallingSocket = io(config.NUXT_PUBLIC_SIGNALLING_URL, {
            transports: ["websocket"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: Infinity,
            autoConnect: true,
        });
    }

    if (!globalThis.__transferSocket) {
        globalThis.__transferSocket = io(config.NUXT_PUBLIC_TRANSFER_URL, {
            transports: ["websocket"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: Infinity,
            autoConnect: true,
        });
    }

    return {
        signallingSocket: globalThis.__signallingSocket,
        transferSocket: globalThis.__transferSocket,
    };
}