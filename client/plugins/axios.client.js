// plugins/axios.client.ts
import { defineNuxtPlugin, useRuntimeConfig } from "#app";
import { useLoginStore } from "@/stores/login";
import { useTokenStore } from "@/stores/token";
import { useRouter } from "vue-router";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import CryptoJS from "crypto-js";

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();
    const router = useRouter();

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
            const tokenStore = useTokenStore();
            const accessToken = tokenStore.accessToken;

            if (accessToken) {
                const tokenStatus = decodeToken(accessToken);
                if (tokenStatus === "expired") {
                    alert("액세스토큰 재발급");
                    try {
                        const refreshToken = tokenStore.enRToken;
                        const { newAccessToken, newRefreshToken } =
                            await requestNewToken(refreshToken);
                        tokenStore.setAccessToken(newAccessToken);
                        tokenStore.setRToken(newRefreshToken);
                        config.headers.jwt = newAccessToken;
                    } catch (e) {
                        alert("만료된 토큰입니다 다시 로그인해주세요");
                        if (typeof window !== "undefined") {
                            window.location.href = "http://localhost:8205";
                        }
                        return Promise.reject(e);
                    }
                } else {
                    config.headers.jwt = accessToken;
                }
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        },
    );

    // 응답 에러 인터셉터
    api.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            console.log("[Axios Plugin] onResponseError", error);
            if (error.response?.status === 401) {
                alert("인증 실패 - 로그인 다시 해주세요");
                if (typeof window !== "undefined") {
                    window.location.href = "http://localhost:8205";
                }
            } else {
                console.log("일반 에러");
            }
            return Promise.reject(error);
        },
    );

    nuxtApp.provide("axios", api);
});

// -------------------- 유틸 함수 --------------------

function decodeToken(jwt) {
    try {
        const decodedJwt = jwtDecode(jwt);
        const unixTime = Math.floor(Date.now() / 1000);
        return decodedJwt.exp > unixTime ? "effective" : "expired";
    } catch {
        console.log("decode fail");
        return "mutated";
    }
}

function decryptData(data) {
    try {
        const decryptBytes = CryptoJS.AES.decrypt(
            data,
            "dsdfjsdl54sd5fsadfjdslksfd87513sdfsdfjkfdsjlk",
        );
        let decryptData = decryptBytes.toString(CryptoJS.enc.Utf8);
        return decryptData || false;
    } catch (err) {
        console.log(`decrypt error: ${err}`);
        return false;
    }
}

function encryptData(data) {
    return CryptoJS.AES.encrypt(
        data,
        "dsdfjsdl54sd5fsadfjdslksfd87513sdfsdfjkfdsjlk",
    ).toString();
}

export async function requestNewToken(currRefereshToken) {
    const loginStore = useLoginStore();
    const decRToken = decryptData(currRefereshToken);

    if (!decRToken) {
        loginStore.setTokenResult(2);
        return Promise.reject(new Error("Invalid refresh token"));
    }

    try {
        const res = await axios.post(
            "https://hdcardev.watttalk.kr/wattmanager-server/accountRest/token_refresh",
            {
                refreshToken: decRToken,
                deviceType: "",
            },
        );
        const newAccessToken = res.data[0];
        const newRefreshToken = encryptData(res.data[1]);
        return { newAccessToken, newRefreshToken };
    } catch (error) {
        if (error.response?.status === 401) {
            alert(error.response.data);
            if (
                error.response.data === "none" ||
                error.response.data === "mutated" ||
                error.response.data === "expired"
            ) {
                loginStore.setTokenResult(2);
                alert("만료된 토큰입니다 다시 로그인해주세요");
                location.href = "http://localhost:8205";
            }
        }
        throw error;
    }
}
