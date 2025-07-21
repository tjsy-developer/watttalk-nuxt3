<template>
    <div class="column align-center alert-container">
        <button @click="alertModalClose" class="col-auto alertCloseBtn">
            <img src="@/assets/images/ic_close.png" alt="Close" class="alertCloseImg" />
        </button>
        <div class="alert-box">
            <div class="alert-title">
                <h3 class="alertTitle">{{ t("알림창") }}</h3>
                <div class="titleUnderLine"></div>
            </div>
            <div v-if="alertStatus == 0">
                <div class="requestStatus alertRequestDeclineMessage">
                    <div class="">
                        <p class="msg alertText">{{ t("현재 통화 중인 방에") }}</p>
                    </div>
                    <div class="">
                        <span class="msg alertText">{{
                            t("호스트가 존재하지 않습니다")
                        }}</span>
                    </div>
                </div>
                <div class="alertControlbuttons">
                    <button @click="alertModalClose" class="hostRequestadelineButton">
                        {{ t("확인") }}
                    </button>
                </div>
            </div>

            <div v-else-if="alertStatus == 1">
                <div class="requestStatus alert RequestDeclineMessage">
                    <div class="">
                        <p class="msg alertText">{{ t("잘못된 요청입니다") }}</p>
                    </div>
                    <div class="">
                        <span class="msg alertText">{{
                            t("호스트가 존재하지 않습니다")
                        }}</span>
                    </div>
                </div>
                <div class="alertControlbuttons">
                    <button @click="alertModalClose" class="hostRequestadelineButton">
                        {{ t("확인") }}
                    </button>
                </div>
            </div>

            <div v-else-if="alertStatus == 2">
                <div class="requestStatus alertRequestDeclineMessage">
                    <div class="">
                        <p class="msg alertText">{{ t("요청자가 PC가 아닙니다") }}</p>
                        <p class="msg alertText">{{ t("호스트는 PC만 가능합니다") }}</p>
                    </div>
                </div>
                <div class="alertControlbuttons">
                    <button @click="alertModalClose" class="hostRequestadelineButton">
                        {{ t("확인") }}
                    </button>
                </div>
            </div>

            <div v-else-if="alertStatus == 4">
                <div class="requestStatus alertRequestDeclineMessage">
                    <div class="">
                        <p class="msg alertText">
                            {{ t("해당 사용자를 강제퇴장 하시겠습니까?") }}
                        </p>
                    </div>
					<div>
						<p>&nbsp;</p>
					</div>
                </div>
                <div class="alertControlbuttons">
                    <button
                        @click="forceLeaveResult(true)"
                        class="hostRequestadelineButton"
                    >
                        {{ t("수락") }}
                    </button>
                    <button
                        @click="forceLeaveResult(false)"
                        class="hostRequestadelineButton"
                    >
                        {{ t("거절") }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { useCommonStore } from "@/stores";
import { useI18n } from "vue-i18n";
const { t, locale: $i18nLocale } = useI18n();
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

.alert-container {
    float: none !important;
    width: 100%;
    height: 100%;
    background-color: #262627;
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.45); /* #00000073 대신 rgba 사용 */
    padding: 19px 10px 38px 10px;
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
}

.alert-title {
    width: 100%;
    text-align: left;
}

/* 닫기 버튼 */
.alertCloseBtn {
    position: absolute;
    top: 5px;
    right: 5px;

    .alertCloseImg {
        /* .alertCloseBtn 내부에 .alertCloseImg 네스팅 */
        width: 14px;
    }
}

/* 모달 제목 */
.alertTitle {
    color: white;
    font-weight: bolder;
    margin-left: 7px;
    margin-bottom: 3px;
}

/* 제목 아래 라인 */
.titleUnderLine {
    width: 100%;
    height: 1px;
    border-top: 1px solid #323232;
}

/* 공통 메시지 텍스트 색상 */
.msg {
    color: white;
}

/* 메시지 박스 */
.alertMessageBox {
    text-align: center;
    height: 150px;
}

/* 요청 상태 관련 스타일 */
.requestStatus {
    padding-bottom: 40px;

    > div {
        /* direct child div */
        &:first-child {
            margin: auto;
        }
        &:last-child {
            width: auto;
            margin: auto;
        }
    }
}

/* 알림 텍스트 */
.alertText {
    color: #d6d6d6;
    font-size: 14px;
    line-height: 1.7;
}

/* 알림 제어 버튼들 */
.alertControlbuttons {
    align-items: center;

	button + button {
		margin-left: 10px;
	}
    > button {
        color: white;
        padding: 6px 22px;
        font-size: 13px;
        border-radius: 15px;
        background-color: #1c8eff;
    }
}
</style>
