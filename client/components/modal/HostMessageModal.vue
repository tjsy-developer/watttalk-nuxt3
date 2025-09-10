<template>
    <div class="align-center alert-container">
        <button v-if="hostRequestStatus != 0" @click="hostModalClose" class="close-btn">
            <img src="@/assets/images/ic_close.png" alt="Close"/>
        </button>
        <div class="alert-box">
            <div class="alert-title">
                <h4 class="title">{{ t("호스트 권한 요청") }}</h4>
                <div class="division"></div>
            </div>
            <section v-if="hostRequestStatus == 0">
                <div class="content">
                    <p class="msg alert-text">
                        {{ `${hostRequestNickname} ${t("님이")}` }}
                    </p>
                    <p class="msg alert-text">{{ t("호스트 권한 요청을 보냈습니다") }}</p>
                </div>
                <div class="control-buttons">
                    <button @click="hostRequestResult('accept')" class="accept-btn">
                        {{ t("수락") }}
                    </button>
                    <button @click="hostRequestResult('reject')" class="decline-btn">
                        {{ t("거절") }}
                    </button>
                </div>
            </section>
            <section v-else-if="hostRequestStatus == 1">
                <div class="content">
                    <p class="msg alert-text">{{ t("수락 대기중입니다") }}</p>
                </div>
            </section>
            <section v-else>
                <div class="content">
                    <p class="msg alert-text">{{ t("상대방이 권한 요청을") }}</p>
                    <p class="msg alert-text">{{ t("거절했습니다") }}</p>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { useCallStore } from "@/stores/call";
import { useNuxtApp } from "nuxt/app";
const { t } = useI18n();
const callStore = useCallStore();
const modalStore = useModalStore();

const hostRequestStatus = computed(() => callStore.hostRequestStatus);
const hostRequestNickname = computed(() => callStore.hostRequestNickname);

function hostModalClose() {
    modalStore.closeModal("host");
}

function hostRequestResult(result) {
    callStore.setHostRequestResult(result);
}
</script>

<style lang="scss" scoped>
p {
    margin: 0 0 0 !important;
}

.alert-container {
    position: relative;
    float: none !important;
    width: 100%;
    height: 100%;
    background-color: #262627;
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.45); /* #00000073 대신 rgba 사용 */
    padding: 19px 37px 38px 37px;
    border: 1px solid #4d4d4d;
    box-sizing: border-box;
}

.alert-box {
    display: flex;
    flex-direction: column;
    gap: 18px;
    align-items: center;
    text-align: center;
    height: 100%;
    justify-content: space-between;
    > section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        row-gap: 40px;
        height: 100%
    }
}

.alert-title {
    width: 100%;
    text-align: left;
}

.close-btn {
    position: absolute;
    top: 5px;
    right: 0px;

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

.msg {
    color: white;
}

.alert-text {
    color: #d6d6d6;
    font-size: 14px;
    line-height: 1.7;
}

.control-buttons {
    align-items: center;

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
</style>
