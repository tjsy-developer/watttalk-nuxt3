// composables/useAuth.ts
import { useLoginStore } from "@/stores/login";
import { useTokenStore } from "@/stores/token";
import { jwtDecode } from "jwt-decode";
import CryptoJS from "crypto-js/core";
import axios from "axios";
import { getManagerDomain } from "@/utils/common";
// import { useTokenStore } from "@/stores/token"; // Pinia 예시

export function useAuth() {
    const tokenStore = useTokenStore();
    // 암호화.
    function encryptData(data) {
        console.log("function encrypt");
        

        const encryptData = CryptoJS.AES.encrypt(
            data,
            "dsdfjsdl54sd5fsadfjdslksfd87513sdfsdfjkfdsjlk",
        ).toString();

        return encryptData;
    }
	async function verifyToken(token) {
        let result = false;
        const decodeResult = decodeToken(token);
        if (decodeResult === "effective") {
            result = true;
        } else if (decodeResult === "expired") {
            tokenStore.setTokenDecodeState("expired");
        } else if (decodeResult === "mutated") {
            tokenStore.setTokenDecodeState("mutated");
        }

        return result;
    }

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

    async function requestNewToken(type = '') {
        const loginStore = useLoginStore();
        const tokenStore = useTokenStore();
        const decRToken = decryptData(tokenStore.enRToken);
        const route = useRoute();

        if (!decRToken) {
            loginStore.setTokenResult(2);
            return Promise.reject(new Error("Invalid refresh token"));
        }
        try {
            const res = await axios.post(
                "https://hdcardev.watttalk.kr/wattmanager-server/accountRest/token_refresh",
                {
                    refreshToken: decRToken,
                    deviceType: type,
                },
            );
            const newAccessToken = res.data[0];
            const newRefreshToken = encryptData(res.data[1]);
            tokenStore.setRToken(newRefreshToken);
            tokenStore.setAccessToken(newAccessToken);
            return { newAccessToken, newRefreshToken };
        } catch (error) {
            if (error.response?.status === 401) {
                if (error.response.data == "mutated") {
                    alert(
                        "토큰 복호화에 실패하였습니다.\n로그인을 다시 진행해주시기 바랍니다",
                    );
                } else if (error.response.data == "expired") {
                    alert(("유효한 로그인 토큰이 아닙니다\n로그인을 다시 진행해주시기 바랍니다"));
                }
                location.href = getManagerDomain();
            }
        }
    }


    return {
        encryptData,
        decryptData,
        verifyToken,
        decodeToken,
        requestNewToken,
    };
}
