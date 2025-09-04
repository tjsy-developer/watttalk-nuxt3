<template>
    <div class="alert-container">
        <button @click="alertModalClose" class="close-btn">
            <img src="@/assets/images/ic_close.png" alt="Close"/>
        </button>

        <div class="alert-box">
            <div class="alert-title">
                <h4 class="title">{{ t("알림창") }}</h4>
                <div class="division"></div>
            </div>
            <section v-if="alertStatus == 0">
                <div class="content">
                    <p class="msg alert-text">
                        {{ t("현재 통화 중인 방에") }}
                    </p>
                    <p class="msg alert-text">{{ t("호스트가 존재하지 않습니다") }}</p>
                </div>
                <div class="control-buttons">
                    <button @click="alertModalClose" class="decline-btn">
                        {{ t("확인") }}
                    </button>
                </div>
            </section>
            <section v-if="alertStatus == 1">
                <div class="content">
                    <p class="msg alert-text">
                        {{ t("잘못된 요청입니다") }}
                    </p>
                    <p class="msg alert-text">{{ t("호스트가 존재하지 않습니다") }}</p>
                </div>
                <div class="control-buttons">
                    <button @click="alertModalClose" class="decline-btn">
                        {{ t("확인") }}
                    </button>
                </div>
            </section>
            <section v-if="alertStatus == 2">
                <div class="content">
                    <p class="msg alert-text">
                        {{ t("요청자가 PC가 아닙니") }}
                    </p>
                    <p class="msg alert-text">{{ t("호스트는 PC만 가능합니다") }}</p>
                </div>
                <div class="control-buttons">
                    <button @click="alertModalClose" class="decline-btn">
                        {{ t("확인") }}
                    </button>
                </div>
            </section>
             <section v-if="alertStatus == 4">
                <div class="content">
                    <p class="msg alert-text">
                        {{ t("해당 사용자를 강제퇴장 하시겠습니까?") }}
                    </p>
                </div>
                                <div class="control-buttons">
                    <button @click="forceLeaveResult(true)" class="accept-btn">
                        {{ t("수락") }}
                    </button>
                    <button @click="forceLeaveResult(false)" class="decline-btn">
                        {{ t("거절") }}
                    </button>
                </div>
            </section>
        </div>
    </div>
</template>
<script setup>
import { useCommonStore } from "@/stores";
import { useNuxtApp } from "nuxt/app";
const { t } = useI18n();
const commonStore = useCommonStore();
const callStore = useCallStore();
const alertStatus = computed(() => commonStore.alertStatus);

function alertModalClose() {
    modalStore.closeModal('message')
}

function forceLeaveResult(result) {
    if (result) {
        callStore.setForceLeaveClickResult(result)
	} else {
		callStore.setForceLeaveClickResult(result)
        alertModalClose();
    }
}
</script>
<style lang="scss" scoped>
/* 일반적인 HTML 요소 스타일 */
p {
    margin: 0 0 0 !important;
}

h4 {
	margin: 0;
}

.alert-container {
    float: none !important;
    min-width: 430px;
    min-height: 326px;
    width: max-content;
    height: max-content;
    background-color: #262627;
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.45); /* #00000073 대신 rgba 사용 */
    padding: 58px 37px 38px 37px;
    border: 1px solid #4d4d4d;
    box-sizing: border-box;
}

.alert-box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    height: 100%;
    width: 100%;
    > section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        width: 100%;
		min-height: 200px;
    }
}

.alert-title {
    width: 100%;
    text-align: left;
}

.close-btn {
    position: absolute;
    top: 5px;
    right: -23px;

    > img {
        width: 14px;
    }
}

.title {
    color: white;
    font-weight: bolder;
    margin-bottom: 3px;
}

.division {
    width: 100%;
    height: 1px;
    border-top: 1px solid #323232;
}

.alert-text {
    color: #d6d6d6;
    line-height: 1.7;
}

.content {
    margin: auto;
	padding: 20px 0;
    &.msg {
        padding-top: 20px;
        font-size: 14px;
        color: yellow;
    }
}

.control-buttons {
    margin-top: auto;

    button + button {
        margin-left: 10px;
    }
    .accept-btn {
        color: white;
        padding: 6px 22px;
        font-size: 13px;
        border-radius: 15px;
        background-color: #1c8eff;
    }
    .decline-btn {
        color: white;
        padding: 6px 22px;
        font-size: 13px;
        border-radius: 15px;
        background-color: #575757;
    }
}

.file-box {
    display: flex;
    .file-label {
        color: #fff;
        font-size: 13px;
        border-radius: 6px;
        margin: 0px 12px 0px 12px;
        width: 100px;
        background-color: grey;
        line-height: 1.6;
        padding: 5px;
        cursor: pointer;
    }

    .file-input {
        width: 100%;
        height: 33px;
        padding: 0 8px;
        background-color: #343434;
        color: #fff;
    }
}
</style>
