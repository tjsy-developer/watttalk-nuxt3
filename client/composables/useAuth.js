// composables/useAuth.ts
import { useAuthStore } from "@/stores/login";
import { useTokenStore } from "@/stores/token";
import { jwtDecode } from "jwt-decode";
import CryptoJS from "crypto-js/core";
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
        console.log(decodeResult);
        if (decodeResult === "effective") {
            result = true;
        } else if (decodeResult === "expired") {
            const requestResult = await requestNewJwt();
            if (requestResult) {
                tokenStore.setTokenDecodeState(true);
                result = true;
            } else {
                tokenStore.setTokenDecodeState("expired");
            }
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

    return {
        encryptData,
        verifyToken,
        decodeToken,
    };
}
