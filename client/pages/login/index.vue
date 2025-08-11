<template>여기는 와트톡 토큰 체크페이지 입니다</template>

<script setup>
import { useAuth } from "@/composables/useAuth";
import { useLoginStore } from "@/stores/login";
import { useTokenStore } from "@/stores/token";
import { useNuxtApp } from "nuxt/app";
import { useRoute } from "vue-router";

const loginStore = useLoginStore();
const commonStore = useCommonStore();

const { $signallingSocket } = useNuxtApp();
// page 또는 컴포넌트에서는 이렇게
onMounted(() => {

});

function LoginAttempt() {
	const obj = {
		localDeviceid: loginStore.m_local_deviceid
	}
	const json = JSON.stringify(obj)
	$signallingSocket.emit("forceLogoutRequest", json)
}
const forcedLogout = computed(() => loginStore.forcedLogout)

watch(forcedLogout, (result) => {
	alert(result)
  if (result) {
    // 모달 변경
    commonStore.setNoneOverlayAlertStatus(23);
    // 로그인 재시도
    LoginAttempt()
  } else {
    // 로그인 타입 3으로 변경
    loginStore.loginType = 3
  }
})
</script>
