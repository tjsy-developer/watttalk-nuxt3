<template>
	<div class="alert-container">
		<div class="alert-box">
            <div class="alert-title">
                <h4 class="title">{{ t("알림창") }}</h4>
                <div class="division"></div>
            </div>
			<section v-if="noneOverlayAlertStatus == 14 && accessDeviceCheck == 'Mobile'">
                <div class="content">
                    <p class="msg alert-text">
                        {{ `${hostRequestNickname} ${t("님이")}` }}
                    </p>
                    <p class="msg alert-text">{{ t("호스트 권한 요청을 보냈습니다") }}</p>
                </div>
                <div class="control-buttons">
                    <button @click="captureSave(true)" class="accept-btn">
                        {{ t("예") }}
                    </button>
                    <button @click="captureSave(false)" class="decline-btn">
                        {{ t("아니오") }}
                    </button>
                </div>
            </section>
			<section v-if="noneOverlayAlertStatus == 1">
                <div class="content">
                    <p class="msg alert-text">{{ t("forceLeave confirm1") }}</p>
                </div>
                <div class="control-buttons">
                    <button @click="forceLeaveResult(true)" class="accept-btn">
                        {{ t("예") }}
                    </button>
                    <button @click="forceLeaveResult(false)" class="decline-btn">
                        {{ t("아니오") }}
                    </button>
                </div>
            </section>

			<section v-if="noneOverlayAlertStatus == 2">
                <div class="content">
                    <p class="msg alert-text">{{ t("영상통화 세션을 종료합니다") }}</p>
					<p class="msg alert-text">{{ t("잠시만 기다려주세요") }}</p>
                </div>
            </section>

			<section v-if="noneOverlayAlertStatus == 3">
                <div class="content">
                    <p class="msg alert-text">{{ t("호스트님이 영상통화에서") }}</p>
					<p class="msg alert-text">{{ t("퇴장 처리하였습니다") }}</p>
					<p class="msg alert-text">{{ t("3초 뒤 통화가 종료됩니다") }}</p>
                </div>
            </section>

			<section v-if="noneOverlayAlertStatus == 4">
                <div class="content">
                    <p class="msg alert-text">{{ t("통화를 종료하시겠습니까?") }}</p>
                </div>
				<div class="control-buttons">
                    <button @click="hangupCallingConfirm(true)" class="accept-btn">
                        {{ t("예") }}
                    </button>
                    <button @click="hangupCallingConfirm(false)" class="decline-btn">
                        {{ t("아니오") }}
                    </button>
                </div>
            </section>

			<section v-if="noneOverlayAlertStatus == 5">
                <div class="content">
                    <p class="msg alert-text">{{ t("회의를 종료하시겠습니까?") }}</p>
                </div>
				<div class="control-buttons">
                    <button @click="hangupCallingConfirm(true)" class="accept-btn">
                        {{ t("예") }}
                    </button>
                    <button @click="hangupCallingConfirm(false)" class="decline-btn">
                        {{ t("아니오") }}
                    </button>
                </div>
            </section>
			<section v-if="noneOverlayAlertStatus == 6">
                <div class="content">
                    <p class="msg alert-text">{{ t("회의가 개설전입니다") }}</p>
					<p class="msg alert-text">{{ t("잠시만 기다려주세요") }}</p>
                </div>
            </section>
			<section v-if="noneOverlayAlertStatus == 7">
                <div class="content">
                    <p class="msg alert-text">{{ t("종료된 회의입니다") }}</p>
                </div>
            </section>
			<section v-if="noneOverlayAlertStatus == 8">
                <div class="content">
                    <p class="msg alert-text">{{ t("삭제된 회의입니다") }}</p>
                </div>
            </section>
			<section v-if="noneOverlayAlertStatus == 9">
                <div class="content">
                    <p class="msg alert-text">{{ t("네트워크 상태가 불안정하여") }}</p>
					<p class="msg alert-text">{{ t("영상 화질이 저하될 수 있습니다") }}</p>
                </div>
				<div class="control-buttons">
                    <button @click="noneOverlayModalClose" class="decline-btn">
                        {{ t("확인") }}
                    </button>
                </div>
            </section>

			<section v-if="noneOverlayAlertStatus == 10">
                <div class="content">
                    <p class="msg alert-text">{{ t("재연결중입니다") }}</p>
                </div>
            </section>

			<section v-if="noneOverlayAlertStatus == 11">
                <div class="content">
                    <p class="msg alert-text">{{ t("드로잉으로 이동하시겠습니까?") }}</p>
                </div>
				<div class="control-buttons">
                    <button @click.once="moveDrawingConfirm(true, 'preview')" class="accept-btn">
                        {{ t("예") }}
                    </button>
                    <button @click.once="moveDrawingConfirm(false, 'preview')" class="decline-btn">
                        {{ t("아니오") }}
                    </button>
                </div>
            </section>
			<section v-if="noneOverlayAlertStatus == 12">
                <div class="content">
                    <p class="msg alert-text">{{ t("드로잉으로 이동하시겠습니까?") }}</p>
					<p class="msg alert-text">{{ t("드로잉으로 이동 시 화면공유가 중지 됩니다") }}</p>
                </div>
				<div class="control-buttons">
                    <button @click.once="moveDrawingConfirm(true, 'screenShareToDrawing')" class="accept-btn">
                        {{ t("예") }}
                    </button>
                    <button @click.once="moveDrawingConfirm(false, 'screenShareToDrawing')" class="decline-btn">
                        {{ t("아니오") }}
                    </button>
                </div>
            </section>
			<section v-if="noneOverlayAlertStatus == 13">
                <div class="content">
                    <p class="msg alert-text">{{ t("화면공유를 시작하시겠습니까?") }}</p>
					<p class="msg alert-text">{{ t("화면공유 시작 시 드로잉이 중지 됩니다") }}</p>
                </div>
				<div class="control-buttons">
                    <button @click="moveScreenShare(true)" class="accept-btn">
                        {{ t("예") }}
                    </button>
                    <button @click="moveScreenShare(false)" class="decline-btn">
                        {{ t("아니오") }}
                    </button>
                </div>
            </section>
			<section v-if="noneOverlayAlertStatus == 14">
                <div class="content">
					<img
						:src="callStore.captureImageInfo.fileSrc"
						style="min-width: 500px; width: 100%; height: 100%; margin: 10px 0;"
					/>
					<p class="msg alert-text">{{ t("capture Image Save") }}</p>
                </div>
				<div class="control-buttons">
                    <button @click="captureSave(true)" class="accept-btn">
                        {{ t("예") }}
                    </button>
                    <button @click="captureSave(false)" class="decline-btn">
                        {{ t("아니오") }}
                    </button>
                </div>
            </section>

			<section v-if="noneOverlayAlertStatus == 15">
                <div class="content">
                    <p class="msg alert-text">{{ t("서버에 업로드 중입니다") }}</p>
                </div>
            </section>
			<section v-if="noneOverlayAlertStatus == 16">
                <div class="content">
                    <p class="msg alert-text">{{ t("캡쳐하신 사진을 저장하였습니다") }}</p>
					<p class="msg alert-text">{{ t("드로잉으로 이동하시겠습니까?") }}</p>
                </div>
				<div class="control-buttons">
                    <button @click.once="moveDrawingConfirm(true, 'capture')" class="accept-btn">
                        {{ t("예") }}
                    </button>
                    <button @click.once="moveDrawingConfirm(false, 'capture')" class="decline-btn">
                        {{ t("아니오") }}
                    </button>
                </div>
            </section>
			<section v-if="noneOverlayAlertStatus == 17">
                <div class="content">
                    <p class="msg alert-text">{{ t("메인화면 글라스에게 고화질 캡쳐를 요청하였습니다") }}</p>
					<p class="msg alert-text">{{ t("잠시 후 고화질 캡쳐 사진이 자동으로 수신됩니다") }}</p>
                </div>
				<div class="control-buttons">
                    <button @click="closeNoneOverlayAlert" class="decline-btn">
                        {{ t("확인") }}
                    </button>
                </div>
            </section>
			<section v-if="noneOverlayAlertStatus == 18">
                <div class="content">
                    <p class="msg alert-text">{{ t("고화질 캡쳐에 실패하였습니다") }}</p>
					<p class="msg alert-text">{{ t("잠시 후 다시 시도해주세요") }}</p>
                </div>
				<div class="control-buttons">
                    <button @click="closeNoneOverlayAlert" class="decline-btn">
                        {{ t("확인") }}
                    </button>
                </div>
            </section>
			<section v-if="noneOverlayAlertStatus == 19">
                <div class="content">
                    <p class="msg alert-text">{{ t("자동 통화 종료를 설정하였습니다") }}</p>
					<p class="msg alert-text">{{ t("잠시 후 통화가 종료 됩니다") }}</p>
                </div>
				<div class="alertControlbuttons" style="margin-top: 30px">
					<p
						v-if="callStore.autoDiscallingResult"
						class="msg alertText"
					>
						{{ t("잠시 후 통화가 종료 됩니다") }}
					</p>
				</div>
				<div class="control-buttons">

					<button v-if="!callStore.autoDiscallingResult"
						@click="autoDiscallingCancel" class="decline-btn">
                        {{ t("cancel") }}
                    </button>
				</div>
            </section>
			<section v-if="noneOverlayAlertStatus == 20">
                <div class="content">
                    <p class="msg alert-text">{{ t("다른 장치에서 로그인 중입니다") }}</p>
					<p class="msg alert-text">{{ t("강제 로그아웃하시겠습니까?") }}</p>
                </div>
				<div class="control-buttons">
                    <button @click="forceLogout(true)" class="accept-btn">
                        {{ t("예") }}
                    </button>
                    <button @click="forceLogout(false)" class="decline-btn">
                        {{ t("아니오") }}
                    </button>
                </div>
            </section>
			<section v-if="noneOverlayAlertStatus == 21">
                <div class="content">
                    <p class="msg alert-text">{{ t("다른 기기에서 로그인 요청으로") }}</p>
					<p class="msg alert-text">{{ t("자동으로 로그아웃됩니다") }}</p>
                </div>
            </section>
			<section v-if="noneOverlayAlertStatus == 22">
                <div class="content">
                    <p class="msg alert-text">{{ t("요청한 기기가 영상통화중이므로") }}</p>
					<p class="msg alert-text">{{ t("로그인할 수 없습니다") }}</p>
					<p class="msg alert-text">{{ t("잠시 후 다시 시도하십시오") }}</p>
                </div>
            </section>
			<section v-if="noneOverlayAlertStatus == 23">
                <div class="content">
                    <p class="msg alert-text">{{ t("강제 로그아웃 중입니다") }}</p>
					<p class="msg alert-text">{{ t("잠시 기다려주십시오") }}</p>
					<p class="msg alert-text">{{ t("잠시 후 다시 시도하십시오") }}</p>
                </div>
            </section>
		</div>
	</div>
</template>

<script setup>
import { useCommonStore } from "@/stores";
import { useDrawingCanvasStore } from "@/stores/drawing";
import { useNuxtApp } from "nuxt/app";
import { computed, onMounted } from "vue";
const { t } = useI18n();

const commonStore = useCommonStore();
const loginStore = useLoginStore();
const callStore = useCallStore();
const modalStore = useModalStore();
const meetingStore = useMeetingStore();
const drawingStore = useDrawingCanvasStore();
const props = defineProps(["blobToUrl"]);

const noneOverlayAlertStatus = computed(() => commonStore.noneOverlayAlertStatus);
const accessDeviceCheck = computed(() => commonStore.accessDeviceCheck);

// 모달 닫기
const closeNoneOverlayAlert = () => {
    modalStore.closeModal("noneOverlayModal");
};

// 자동 통화 종료 취소
const autoDiscallingCancel = () => {
    modalStore.closeModal("noneOverlayModal");

	callStore.setAutoDiscallingCancel(true);
	callStore.setAutoDiscallingResult(false);
};

// 강제 퇴장 결과
const forceLeaveResult = (result) => {
    if (result) {
        callStore.setForceLeaveClickResult(result);
    } else {
        modalStore.closeModal("noneOverlayModal");
    }
};

// 통화 종료 확인 팝업
const hangupCallingConfirm = (result) => {
	if (result) {
		callStore.setHangupCallingConfirmFlag(result);
	} else {
		modalStore.closeModal("noneOverlayModal");
	}
}

// 드로잉 이동 확인
const moveDrawingConfirm = (result, type) => {
    setTimeout(() => {
        if (type === "preview") {
            if (result) {
               callStore.setReceiverImagePath(props.blobToUrl);
                modalStore.closeModal("noneOverlayModal");

                if (commonStore.isShare) {
                    commonStore.setIsShare();
                    setTimeout(() => {
                        commonStore.setIsDrawing();
                    }, 1000);
                } else {
                    setTimeout(() => {
                        commonStore.setIsDrawing();
                    }, 1000);
                }
                drawingStore.setDrawingVideo(false);
                commonStore.setIsDrawingEnable(true);
            } else {
                modalStore.closeModal("noneOverlayModal");
            }
        } else if (type === "capture") {
            if (result) {
                modalStore.closeModal("noneOverlayModal");

                if (commonStore.isShare) {
                    commonStore.setIsShare();
                    setTimeout(() => {
                        commonStore.setIsDrawing();
                    }, 1000);
                } else {
                    setTimeout(() => {
                        commonStore.setIsDrawing();
                    }, 1000);
                }
                drawingStore.setDrawingVideo(false);
                commonStore.setIsDrawingEnable(true);
            } else {
                modalStore.closeModal("noneOverlayModal");
            }
        } else if (type === "screenShareToDrawing") {
            if (result) {
				callStore.setScreenMoveToDrawing(true);
                if (commonStore.isShare) {
                    commonStore.setIsShare();
                }
                modalStore.closeModal("noneOverlayModal");
                drawingStore.setDrawingVideo(false);
                commonStore.setIsDrawingEnable(true);
            } else {
                modalStore.closeModal("noneOverlayModal");
            }
        }
    }, 1000);
};

// 드로잉 -> 화면 공유 이동
const moveScreenShare = (result) => {
    if (result) {
       callStore.setDrawingMoveToScreen(true);

        if (commonStore.isDrawing) {
            commonStore.setIsDrawing();
        }
        modalStore.closeModal("noneOverlayModal");
        drawingStore.setDrawingVideo(true);
    } else {
        modalStore.closeModal("noneOverlayModal");
    }
};

// 화면 캡쳐 저장
const captureSave = (result) => {
    if (result) {
        if (callStore.isCapture) {
            modalStore.closeModal("noneOverlayModal");
           	callStore.setCaptureSaveFlag(true);
            drawingStore.setDrawingVideo(false);
        }
    } else {
        modalStore.closeModal("noneOverlayModal");
       callStore.setIsCapture(false);
    }
};

// 강제 로그아웃
const forceLogout = (result) => {
    if (result) {
        loginStore.setForcedLogout(result);
    } else {
		loginStore.setForcedLogout(result);
		modalStore.closeModal("noneOverlayModal");
		location.href = "http://localhost:8205"
    }
};

onMounted(() => {
    // 고화질 캡쳐 요청 팝업 일 경우 자동으로 5초 뒤 사라질 수 있도록 하는 소스
    if (noneOverlayAlertStatus.value === 17) {
        setTimeout(() => {
            if (commonStore.noneOverlayAlertStatus === 17) {
                modalStore.closeModal("noneOverlayModal");
            }
        }, 5000);
    }
});
</script>

<style lang="scss" scoped>
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
