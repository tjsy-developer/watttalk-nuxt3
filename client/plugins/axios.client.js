// plugins/axios.client.ts
import { defineNuxtPlugin, useRuntimeConfig } from "#app";
import { useLoginStore } from "@/stores/login";
import { useTokenStore } from "@/stores/token";
import { useRouter } from "vue-router";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import CryptoJS from "crypto-js";
import { useAuth } from "@/composables/useAuth";

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();
    const router = useRouter();
    const { verifyToken, encryptData, requestNewToken } = useAuth();
    if (process.client) {
        
        const isLocalhost =
            typeof window !== "undefined" &&
            (window.location.hostname === "localhost" ||
                window.location.origin === "https://192.168.20.66:3000");

        const baseURL = isLocalhost
            ? "https://hdcardev.watttalk.kr/wattmanager-server"
            : "/wattmanager-server";

        // Axios 인스턴스 생성
        const api = axios.create({
            baseURL,
            timeout: 10000,
            headers: { "Content-Type": "application/json" },
        });

        // 요청 인터셉터
        api.interceptors.request.use(
            async (config) => {
                console.log(config);
                const tokenStore = useTokenStore();
                const accessToken = tokenStore.accessToken;

                // if (accessToken) {
                //     const tokenStatus = decodeToken(accessToken);
                //     if (tokenStatus === "expired") {
                //         alert("액세스토큰 재발급");
                //         try {
                //             const refreshToken = tokenStore.enRToken;
                //             const { newAccessToken, newRefreshToken } =
                //                 await requestNewToken(refreshToken);
                //             tokenStore.setAccessToken(newAccessToken);
                //             tokenStore.setRToken(newRefreshToken);
                //             config.headers.jwt = newAccessToken;
                //         } catch (e) {
                //             alert("만료된 토큰입니다 다시 로그인해주세요");
                //             // if (typeof window !== "undefined") {
                //             //     window.location.href = "http://localhost:8205";
                //             // }
                //             // return Promise.reject(e);
                //         }
                //     } else {
                //         config.headers.jwt = accessToken;
                //     }
                // }
                config.headers.jwt = accessToken;
                return config;
            },
            (error) => {
                return Promise.reject(error);
            },
        );
        let isRefresh = false;
        // 응답 에러 인터셉터
        api.interceptors.response.use(
            (response) => {
                console.log(response);
                return response;
            },
            async (error) => {
                console.log(error);
                const tokenStore = useTokenStore();
                const originalRequest = error.config;
                if (error.status == 401) {
                    if (error.response.data == "none") {
                        alert("잘못된 접근입니다");
                        location.href = getManagerDomain();
                    } else if (error.response.data == "mutated") {
                        alert("유효한 토큰이 아닙니다");
                        location.href = getManagerDomain();
                    } else if (error.response.data == "expired") {
                        if (!isRefresh) {
                            isRefresh = true;
                        }
                        await requestNewToken(tokenStore.enRToken);
                    }
                }
            },
        );

        nuxtApp.provide("axios", api);
    }
});
