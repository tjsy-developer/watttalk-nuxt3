<script setup>
import { useImageAssets } from "@/composables/useImageAssets";
import { useLoginStore } from "@/stores/login";
import { useTokenStore } from "@/stores/token";
import { getManagerDomain } from "@/utils/common";
import { useNuxtApp } from "nuxt/app";
import { onMounted, ref } from "vue";
import { useModal, useModalSlot, useVfm } from "vue-final-modal";

const vfm = useVfm();
const { $axios } = useNuxtApp();
const isMainMenuOpen = ref(false);
const isSubMenuOpen = ref(false);
const loginStore = useLoginStore();
const tokenStore = useTokenStore();
const { menuImages } = useImageAssets();
const { t } = useI18n();

onMounted(async () => {
    const res = await $axios.post("noticeRest/notice_list", {
        en_seq: loginStore.sessionEnSeq,
    });
    if (res.data.length > 0) {
        vfm.toggle("notice-modal");
    }
});
const handleClickNotice = () => {
    // open();
    vfm.toggle("notice-modal");
    console.log(vfm);
};

const handleClickCloud = () => {
    const params = {
        accessToken: tokenStore.accessToken,
        refreshToken: tokenStore.enRToken,
        en_seq: loginStore.sessionEnSeq,
        hq_seq: loginStore.sessionHqSeq,
        br_seq: loginStore.sessionBrSeq,
        auth: loginStore.sessionAuth,
        user_id: loginStore.m_local_deviceid,
        user_name: loginStore.nickname,
        user_seq: loginStore.userSeq,
        en_alias: loginStore.institution,
        hq_alias: loginStore.headquarters,
        br_alias: loginStore.branch,
        email: loginStore.sessionEmail,
        device_type: loginStore.sessionDeviceType,
    };
    const queryString = new URLSearchParams(params).toString();
    const domain = `${getManagerDomain()}/login?${queryString}`;
    window.open(domain, "target");
};
</script>

<template>
    <div class="leftbar">
        <router-link to="/dashboard" class="icon-btn" title="연락처">
            <img :src="menuImages.call" />
            <label class="icon-label">{{ t("연락처") }}</label>
        </router-link>

        <router-link to="/meeting" class="icon-btn" title="회의실">
            <img :src="menuImages.meetingRoom" />
            <label class="icon-label">{{ t("회의실") }}</label>
        </router-link>
        <a @click="handleClickCloud" target="_blank" class="icon-btn" title="클라우드">
            <img :src="menuImages.cloud" />
            <label class="icon-label">{{ t("클라우드") }}</label>
        </a>
        <div class="icon-btn bell" title="알림" @click="handleClickNotice">
            <img :src="menuImages.notice" :alt="t('알림')" />
            <div class="new">&nbsp;</div>
        </div>
        <audio id="calling_bell" loop style="display: none">
            <source src="@/assets/sounds/Wood.ogg" type="audio/ogg" />
        </audio>
        <audio id="normal_message_bell" style="display: none">
            <source src="@/assets/sounds/normal_message.mp3" type="audio/mp3" />
        </audio>
        <audio id="emergency_message_bell" style="display: none">
            <source src="@/assets/sounds/emergency_message.mp3" type="audio/mp3" />
        </audio>
        <audio id="direct_message_bell" style="display: none">
            <source src="@/assets/sounds/goes-without-saying.ogg" type="audio/ogg" />
        </audio>
        <audio id="fileReceive_message_bell" style="display: none">
            <source src="@/assets/sounds/file-receive.wav" type="audio/wav" />
        </audio>
        <audio id="emergency_alarm_bell" style="display: none">
            <source src="@/assets/sounds/emergency_alarm.wav" type="audio/wav" />
        </audio>
    </div>
    <canvas id="videoNone" style="display: none"></canvas>
</template>

<style lang="scss" scoped>
.new {
    width: 7px;
    height: 7px;
    border-radius: 7px;
    background-color: red;
    position: absolute;
    top: 22px;
    right: 23px;
}
</style>
