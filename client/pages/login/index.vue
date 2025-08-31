<template>
  <div class="login-check-container">
    <img :src="loginLoadingImage"/>
  </div>
</template>

<script setup>
import { useUserPreferenceStore } from "@/stores/common";
import { useLoginStore } from "@/stores/login";
import { useSignallingSocket } from "@/composables/socket/useSignallingSocket";

const loginStore = useLoginStore();
const commonStore = useCommonStore();
const prefrenceStore = useUserPreferenceStore();

const { signallingSocket } = useSignallingSocket();
const loginLoadingImage = ref();

import imgLoginKo from "@/assets/images/1_login.png";
import imgLoginEn from "@/assets/images/1_login_en.png";
import imgConfirmKo from "@/assets/images/2_confirm.png";
import imgConfirmEn from "@/assets/images/2_confirm_en.png";
import imgLogoutKo from "@/assets/images/3_logout.png";
import imgLogoutEn from "@/assets/images/3_logout_en.png";


// definePageMeta({
//   layout: false
// })

onMounted(() => {
  const loginType = loginStore.loginType;
  const lang = prefrenceStore.lang;

  if (loginType == 1) {
    loginLoadingImage.value = lang === "ko" ? imgLoginKo : imgLoginEn;
  } else if (loginType == 2) {
    loginLoadingImage.value = lang === "ko" ? imgConfirmKo : imgConfirmEn;
  } else {
    loginLoadingImage.value = lang === "ko" ? imgLogoutKo : imgLogoutEn;
  }
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