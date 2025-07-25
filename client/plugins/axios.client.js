// plugins/axios.client.ts
import { useLoginStore } from "@/stores/login";
import { useTokenStore } from "@/stores/token";
import axios from "axios";
import CryptoJS from "crypto-js";
import { useNuxtApp } from "nuxt/app";
import { useRouter } from "vue-router";

export default defineNuxtPlugin((nuxtApp) => {

    if (process.client) {
        const config = useRuntimeConfig();
        const router = useRouter();

        const isLocalhost =
            (process.client && window.location.hostname === "localhost") ||
            window.location.origin == "https://192.168.20.66:3000";
        const instance = axios.create({
            baseURL: isLocalhost
                ? "https://hdcardev.watttalk.kr/wattmanager-server" // ✅ 로컬일 때 완전한 URL
                : "/wattmanager-server",
            timeout: 10000,
        });

        // 🔐 Request Interceptor (예: 토큰 자동 주입)
        instance.interceptors.request.use(
            async (config) => {
                const tokenStore = useTokenStore(); // Pinia 스토어에서 토큰 가져오기
                const accessToken = tokenStore.accessToken;

                if (accessToken) {
                    const tokenStatus = decodeToken(accessToken);
                    if (tokenStatus === "expired") {
                        try {
                            // 1) 리프레시 토큰으로 액세스 토큰 재발급 요청
                            const refreshToken = tokenStore.enRToken;
                            const { newAccessToken, newRefreshToken } =
                                await requestNewToken(refreshToken); // API 호출 함수
                            tokenStore.setAccessToken(newAccessToken);
                            tokenStore.setRToken(newRefreshToken);
                            config.headers.jwt = newAccessToken;
                        } catch (e) {
                            // 재발급 실패 시, 로그인 페이지 이동 or 로그아웃 처리
                            alert("만료된 토큰입니다 다시 로그인해주세요");
                            window.location.href = "http://localhost:8223";
                            return Promise.reject(e);
                        }
                    } else {
                        config.headers.jwt = accessToken;
                    }
                }
                config.headers["Content-Type"] = "application/json";
                return config;
            },
            (error) => {
                return Promise.reject(error);
            },
        );

        // 🚨 Response Interceptor (예: 에러 처리)
        instance.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                console.log(error);
                alert(error);
                window.location.href = "http://localhost:8223";
                // if (error.response?.status === 401) {
                //     console.warn("인증 실패 - 로그인 다시 해주세요");

                // }
                return Promise.reject(error);
            },
        );

        // Nuxt 앱에 주입
        nuxtApp.provide("axios", instance);   
    }
});

function decodeToken(jwt) {
    try {
        const decodeJwt = jwtDecode(jwt);
        const unixTime = Math.floor(Date.now() / 1000);

        return decodeJwt.exp > unixTime ? "effective" : "expired";
    } catch {
        console.log("decode fail");
        return "mutated";
    }
}
function decryptData(data) {
    console.log("function decrypt");
    try {
        console.log(CryptoJS.AES)
        const decryptBytes = CryptoJS.AES.decrypt(
            data,
            "dsdfjsdl54sd5fsadfjdslksfd87513sdfsdfjkfdsjlk",
        );

        let decryptData = decryptBytes.toString(CryptoJS.enc.Utf8);

        // 복호화 결과가 무효한 경우
        if (!decryptData) decryptData = false;

        return decryptData;
    } catch (err) {
        // 복호화 못한 경우
        console.log(`decrypt error: ${err.message}`);
        return false;
    }
};
// 암호화.
function encryptData(data) {
    console.log("function encrypt");
    const encryptData = CryptoJS.AES.encrypt(
        data,
        "dsdfjsdl54sd5fsadfjdslksfd87513sdfsdfjkfdsjlk",
    ).toString();

    return encryptData;
}

export async function requestNewToken(currRefereshToken) {
    console.log(`func request Token`);
    const { $axios } = useNuxtApp();
    const loginStore = useLoginStore();
    const decRToken = await decryptData(currRefereshToken);

    if (!decRToken) {
        loginStore.setTokenResult(2);
        return false;
    }

    try {
        const res = await $axios.post("/accountRest/token_refresh", {
            refreshToken: decRToken,
            deviceType: '',
        });
        const  newAccessToken = res.data[0];
        const newRefreshToken = encryptData(res.data[1]);
        return { newAccessToken, newRefreshToken }
    } catch (error) {
        console.log(`request new jwt err: ${error}`);
        const err = error.response;
        if (err?.status === 401) {
            alerT(err.data)
            if (err.data === "none" || err.data === "mutated" || err.data === "expired") {
                loginStore.setTokenResult(2);
                throw '만료된 토큰입니다 다시 로그인해주세요'
            } else {
                throw error;
            }
        }
        
    }
}