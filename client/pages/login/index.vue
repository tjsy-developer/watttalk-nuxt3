<template>
    <div class="login-check-container">
        <img :src="loginLoadingImage" />
    </div>
</template>

<script setup>
import { useUserPreferenceStore } from "@/stores/common";
import { useLoginStore } from "@/stores/login";
import { useSignallingSocket } from "@/composables/socket/useSignallingSocket";

const loginStore = useLoginStore();
const commonStore = useRoomStore();
const tokenStore = useTokenStore();
const prefrenceStore = useUserPreferenceStore();

const { signallingSocket } = useSignallingSocket();
const loginLoadingImage = ref();

import imgLoginKo from "@/assets/images/1_login.png";
import imgLoginEn from "@/assets/images/1_login_en.png";
import imgConfirmKo from "@/assets/images/2_confirm.png";
import imgConfirmEn from "@/assets/images/2_confirm_en.png";
import imgLogoutKo from "@/assets/images/3_logout.png";
import imgLogoutEn from "@/assets/images/3_logout_en.png";
import { jwtDecode } from "jwt-decode";
import { useLoginEvents } from "@/composables/socket/useLoginEvents";

const route = useRoute();
const { encryptData } = useAuth();
const { loginRequest, listenLoginEvent, requestEnvironment } = useLoginEvents();

// definePageMeta({
//   layout: false
// })

onMounted(async () => {
    const accessToken = route.query.jwt_token;
    const loginType = route.query.login_type;
    const rToken = route.query.rToken;
    const reservId = route.query.reservId;
    const lang = prefrenceStore.lang;
    if (loginType == 1) {
        loginLoadingImage.value = lang === "ko" ? imgLoginKo : imgLoginEn;
    } else if (loginType == 2) {
        loginLoadingImage.value = lang === "ko" ? imgConfirmKo : imgConfirmEn;
    } else {
        loginLoadingImage.value = lang === "ko" ? imgLogoutKo : imgLogoutEn;
    }

    if (!accessToken || !rToken) {
        console.log("파워매니저로 돌아가세요");
        return;
    }

    const decodedUserInfo = jwtDecode(accessToken);
    await loginStore.setTokenInfo(decodedUserInfo);
    const encryptRefreshToken = encryptData(rToken);
    tokenStore.setRToken(encryptRefreshToken);
    tokenStore.setAccessToken(accessToken);
    loginStore.setLoginType(loginType);
    sessionStorage.setItem("isInvited", reservId ? "true" : "false");
    loginRequest(decodedUserInfo.id);
});

function LoginAttempt() {
    const obj = {
        localDeviceid: loginStore.m_local_deviceid,
    };
    const json = JSON.stringify(obj);
    signallingSocket.emit("forceLogoutRequest", json);
}
const forcedLogout = computed(() => loginStore.forcedLogout);

watch(forcedLogout, (result) => {
    if (result) {
        // 모달 변경
        commonStore.setNoneOverlayAlertStatus(23);
        // 로그인 재시도
        LoginAttempt();
    } else {
        // 로그인 타입 3으로 변경
        loginStore.loginType = 3;
    }
});
</script>

<style lang="scss" scoped>
.login-check-container {
    width: 100vw;
    height: 100vh;
    background-color: #262627;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
        width: 200px;
        margin-bottom: 15rem;
    }
}
</style>
