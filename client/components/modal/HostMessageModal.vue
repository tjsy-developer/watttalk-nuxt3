<template>
    <div class="column align-center alert-container">
        <button v-if="hostRequestStatus != 0" @click="hostModalClose" class="col-auto alertCloseBtn">
            <img src="@/assets/images/ic_close.png" alt="Close" class="alertCloseImg" />
        </button>
        <div class="alert-box">
            <div class="alert-title">
                <h4 class="alertTitle">{{ $t("호스트 권한 요청") }}</h4>
                <div class="titleUnderLine"></div>
            </div>
            <div v-if="hostRequestStatus == 0">
                <div class="requestStatus alertRequestDeclineMessage">
                    <div class="">
                        <p class="msg alertText"> {{ `${hostRequestNickname} ${$t('님이')}` }}</p>
                    </div>
                    <div class="">
                        <span class="msg alertText">{{
                            $t("호스트 권한 요청을 보냈습니다")
                        }}</span>
                    </div>
                </div>
                <div class="alertControlbuttons">
                    <button @click="hostRequestResult('accept')" class="hostRequestadelineButton">
                        {{ $t("수락") }}
                    </button>
					<button @click="hostRequestResult('reject')" class="hostRequestadelineButton">
                        {{ $t("거절") }}
                    </button>
                </div>
            </div>
            <div v-else-if="hostRequestStatus == 1">
                <div class="requestStatus alert RequestDeclineMessage">
                    <div class="">
                        <p class="msg alertText">{{ $t("호스트 권한 요청을 보냈습니다") }}</p>
                    </div>
                    <div class="">
                        <span class="msg alertText">{{
                            $t("수락 대기중입니다")
                        }}</span>
                    </div>
                </div>
            </div>
            <div v-else>
                <div class="requestStatus alertRequestDeclineMessage">
                    <div class="">
                        <p class="msg alertText">{{ $t("상대방이 권한 요청을") }}</p>
                        <p class="msg alertText">{{ $t("거절했습니다") }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useCallStore } from "@/stores/call";

const callStore = useCallStore();
const modalStore = useModalStore();

const hostRequestStatus = computed(() => callStore.hostRequestStatus);
const hostRequestNickname = computed(() => callStore.hostRequestNickname);

function hostModalClose() {
    modalStore.closeModal('host')
}

function hostRequestResult(result) {
    callStore.setHostRequestResult(result)
}
</script>

<style lang="scss" scoped>
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
