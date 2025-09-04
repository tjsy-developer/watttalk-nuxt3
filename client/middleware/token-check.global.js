import { useLoginStore } from "@/stores/login";
import { useTokenStore } from "@/stores/token";
import { jwtDecode } from "jwt-decode";
import { useRoute } from "vue-router";
import CryptoJS from "crypto-js";
function encryptData(data) {
	return CryptoJS.AES.encrypt(
		data,
		"dsdfjsdl54sd5fsadfjdslksfd87513sdfsdfjkfdsjlk",
	).toString();
}

export default defineNuxtRouteMiddleware(async (to, path) => {
    if (process.server) return;

	const route = useRoute();
	const tokenStore = useTokenStore();
	const loginStore = useLoginStore();
	let checkToken = route.query.jwt_token || tokenStore.accessToken;

	try {
        const { $axios } = useNuxtApp();
        const res = await $axios.post("homeRest/tokenCheck", {
            jwt: checkToken,
		});
        if (res.data) {
            loginStore.setTokenResult(0);
        } else {
            alert("복호화 실패");
            window.location.href = "http://localhost:8205";
            return;
        }
    } catch (err) {
        console.log(err);
    }

	// 로그인 페이지 쿼리 파라미터 처리
    if (to.name === "login") {
        const accessToken = route.query.jwt_token;
        const loginType = route.query.login_type;
        const rToken = route.query.rToken;
        const reservId = route.query.reservId;

        if (!accessToken || !rToken) {
            console.log("파워매니저로 돌아가세요");
            return;
		}

		const decodedUserInfo = jwtDecode(checkToken);
		await loginStore.setTokenInfo(decodedUserInfo);
		const encryptRefreshToken = encryptData(rToken);
        tokenStore.setRToken(encryptRefreshToken);
        tokenStore.setAccessToken(accessToken);
        loginStore.setLoginType(loginType);
        sessionStorage.setItem("isInvited", reservId ? "true" : "false");
	}
});
