// plugins/fetch.client.js
import { useLoginStore } from "@/stores/login";
import { useTokenStore } from "@/stores/token";
import { useNuxtApp } from "nuxt/app";
import { useRouter } from "vue-router";
import { jwtDecode } from "jwt-decode";
import CryptoJS from "crypto-js";

export default defineNuxtPlugin({
    name: "fetch-plugin",
    enforce: "pre",
    setup(nuxtApp) {
        const config = useRuntimeConfig();
        const router = useRouter();

        const isLocalhost =
            typeof window !== "undefined" &&
            (window.location.hostname === "localhost" ||
                window.location.origin === "https://192.168.20.66:3000");
        const baseURL = isLocalhost
            ? "https://hdcardev.watttalk.kr/wattmanager-server"
            : "/wattmanager-server";

        nuxtApp.$fetch = $fetch.create({
            baseURL: baseURL,
            timeout: 10000,
            headers: {
                "Content-Type": "application/json",
            },

            async onRequest({ request, options }) {
                console.log("[Fetch Plugin] onRequest");
                // ✅ Pinia 스토어를 콜백 함수 내에서 가져옵니다.
                const tokenStore = useTokenStore();
                const accessToken = tokenStore.accessToken;

                if (accessToken) {
                    const tokenStatus = decodeToken(accessToken);
                    if (tokenStatus === "expired") {
                        // 🚨 ALERT 대신 커스텀 모달 사용 권장
                        alert("액세스토큰 재발급");
                        try {
                            const refreshToken = tokenStore.enRToken;
                            const { newAccessToken, newRefreshToken } =
                                await requestNewToken(refreshToken);
                            tokenStore.setAccessToken(newAccessToken);
                            tokenStore.setRToken(newRefreshToken);
                            options.headers = { ...options.headers, jwt: newAccessToken };
                        } catch (e) {
                            // 🚨 ALERT 대신 커스텀 모달 사용 권장
                            alert("만료된 토큰입니다 다시 로그인해주세요");
                            if (typeof window !== "undefined") {
                                window.location.href = "http://localhost:8205";
                            }
                            return Promise.reject(e);
                        }
                    } else {
                        options.headers = { ...options.headers, jwt: accessToken };
                    }
                }
            },

            onResponseError({ request, response, options }) {
                console.log("[Fetch Plugin] onResponseError");
                console.log(response);
                if (response?.status === 401) {
                    // 🚨 ALERT 대신 커스텀 모달 사용 권장
                    alert("인증 실패 - 로그인 다시 해주세요");
                    if (typeof window !== "undefined") {
                        window.location.href = "http://localhost:8205";
                    }
                } else {
                    console.log("일반 에러");
                }
            },
        });
    },
});

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
    // ✅ Pinia 스토어를 함수 내에서 가져옵니다.
    const loginStore = useLoginStore();
    const decRToken = decryptData(currRefereshToken);

    if (!decRToken) {
        loginStore.setTokenResult(2);
        return false;
    }

    try {
        const res = await $fetch("/accountRest/token_refresh", {
            baseURL: "https://hdcardev.watttalk.kr/wattmanager-server",
            method: "POST",
            body: {
                refreshToken: decRToken,
                deviceType: "",
            },
        });
        const newAccessToken = res[0];
        const newRefreshToken = encryptData(res[1]);
        return { newAccessToken, newRefreshToken };
    } catch (error) {
        if (error.status === 401) {
            // 🚨 ALERT 대신 커스텀 모달 사용 권장
            alert(error.data);
            if (
                error.data === "none" ||
                error.data === "mutated" ||
                error.data === "expired"
            ) {
                loginStore.setTokenResult(2);
                alert("만료된 토큰입니다 다시 로그인해주세요");
                location.href = "http://localhost:8205"
            } else {
                throw error;
            }
        }
        throw error;
    }
}
