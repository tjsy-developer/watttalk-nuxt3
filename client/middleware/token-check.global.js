import { useLoginStore } from "@/stores/login";
import { useTokenStore } from "@/stores/token";
import { jwtDecode } from "jwt-decode";
import { useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";

export default defineNuxtRouteMiddleware(async (to, path) => {
    if (process.server) return;

	const route = useRoute();
	const tokenStore = useTokenStore();
	const loginStore = useLoginStore();
	let checkToken = route.query.jwt_token || tokenStore.accessToken;
    const { verifyToken, encryptData, requestNewToken } = useAuth();
    // const { t } = useI18n();
    try {
        const result = await verifyToken(checkToken);
        if (result) {
            const { $axios } = useNuxtApp();
            const res = await $axios.post("homeRest/tokenCheck", {
                jwt: checkToken,
            });
            if (res.data) {
                loginStore.setTokenResult(0);
            } else {
                alert(t("loginResult NotValid"));
                window.location.href = "http://localhost:8205";
                return;
            }
        } else {
            await requestNewToken(tokenStore.enRToken);
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
