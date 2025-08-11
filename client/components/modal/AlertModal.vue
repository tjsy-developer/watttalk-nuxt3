<template>
	<div class="column row align-center noneOverayModalContainer">
		<div class="row col-12">
			<div
				class="alertTitleCon"
				:class="[noneOverlayAlertStatus == 14 ? 'col-auto' : '']"
			>
				<span class="alertTitle">{{ t("알림창") }}</span>
			</div>

			<div
				v-if="noneOverlayAlertStatus == 14 && accessDeviceCheck == 'Mobile'"
				class="row col items-center justify-end mobileScreenCaptureBox"
			>
				<p class="msg mobileScreenCaptureText">{{ t("capture Image Save") }}</p>
				<div
					class="row items-center alertControlbuttons mobileScreenCaptureButtons"
				>
					<button @click="captureSave(true)" class="hostRequestadelineButton">
						{{ t("예") }}
					</button>
					<button @click="captureSave(false)" class="hostRequestadelineButton">
						{{ t("아니오") }}
					</button>
				</div>
			</div>
			<div class="col-12 titleUnderLine"></div>
			<div
				v-if="noneOverlayAlertStatus == 1"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">{{ t("forceLeave confirm1") }}</p>
					</div>
				</div>
				<div class="alertControlbuttons">
					<button
						@click="forceLeaveResult(true)"
						class="hostRequestadelineButton"
					>
						{{ t("예") }}
					</button>
					<button
						@click="forceLeaveResult(false)"
						class="hostRequestadelineButton"
					>
						{{ t("아니오") }}
					</button>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 2"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12 call">
						<p class="msg alertText">{{ t("영상통화 세션을 종료합니다") }}</p>
					</div>
					<div class="col-12 call">
						<p class="msg alertText">{{ t("잠시만 기다려주세요") }}</p>
					</div>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 3"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">{{ t("호스트님이 영상통화에서") }}</p>
					</div>
					<div class="col-12">
						<p class="msg alertText">{{ t("퇴장 처리하였습니다") }}</p>
					</div>
					<div class="col-12">
						<p class="msg alertText">{{ t("3초 뒤 통화가 종료됩니다") }}</p>
					</div>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 4"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">{{ t("통화를 종료하시겠습니까?") }}</p>
					</div>
				</div>
				<div class="alertControlbuttons" style="margin-top: 20px">
					<button
						@click="hangupCallingConfirm(true)"
						class="hostRequestadelineButton"
					>
						{{ t("예") }}
					</button>
					<button
						@click="hangupCallingConfirm(false)"
						class="hostRequestadelineButton"
					>
						{{ t("아니오") }}
					</button>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 5"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">{{ t("회의를 종료하시겠습니까?") }}</p>
					</div>
				</div>
				<div class="alertControlbuttons" style="margin-top: 20px">
					<button
						@click="hangupCallingConfirm(true)"
						class="hostRequestadelineButton"
					>
						{{ t("예") }}
					</button>
					<button
						@click="hangupCallingConfirm(false)"
						class="hostRequestadelineButton"
					>
						{{ t("아니오") }}
					</button>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 6"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">{{ t("회의가 개설전입니다") }}</p>
					</div>
					<div class="col-12">
						<p class="msg alertText">{{ t("잠시만 기다려주세요") }}</p>
					</div>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 7"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">{{ t("종료된 회의입니다") }}</p>
					</div>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 8"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">{{ t("삭제된 회의입니다") }}</p>
					</div>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 9"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">{{ t("네트워크 상태가 불안정하여 영상 화질이 저하될 수 있습니다") }}</p>
					</div>
				</div>
				<div class="alertControlbuttons" style="margin-top: 30px">
					<button @click="noneOverlayModalClose">{{ t("확인") }}</button>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 10"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">{{ t("재연결중입니다") }}</p>
					</div>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 11"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">{{ t("드로잉으로 이동하시겠습니까?") }}</p>
					</div>
				</div>
				<div class="alertControlbuttons" style="margin-top: 20px">
					<button
						@click.once="moveDrawingConfirm(true, 'preview')"
						class="hostRequestadelineButton"
					>
						{{ t("예") }}
					</button>
					<button
						@click.once="moveDrawingConfirm(false, 'preview')"
						class="hostRequestadelineButton"
					>
						{{ t("아니오") }}
					</button>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 12"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">{{ t("드로잉으로 이동하시겠습니까?") }}</p>
						<p class="msg alertText">
							{{ t("드로잉으로 이동 시 화면공유가 중지 됩니다") }}
						</p>
					</div>
				</div>
				<div class="alertControlbuttons" style="margin-top: 20px">
					<button
						@click.once="moveDrawingConfirm(true, 'screenShareToDrawing')"
						class="hostRequestadelineButton"
					>
						{{ t("예") }}
					</button>
					<button
						@click.once="moveDrawingConfirm(false, 'screenShareToDrawing')"
						class="hostRequestadelineButton"
					>
						{{ t("아니오") }}
					</button>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 13"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">{{ t("화면공유를 시작하시겠습니까?") }}</p>
						<p class="msg alertText">{{ t("화면공유 시작 시 드로잉이 중지 됩니다") }}</p>
					</div>
				</div>
				<div class="alertControlbuttons" style="margin-top: 20px">
					<button
						@click="moveScreenShare(true)"
						class="hostRequestadelineButton"
					>
						{{ t("예") }}
					</button>
					<button
						@click="moveScreenShare(false)"
						class="hostRequestadelineButton"
					>
						{{ t("아니오") }}
					</button>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 14"
				style="height: 100%; width: 100%"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div
					class="row requestStatus alertRequestDeclineMessage col-12"
					style="width: 100%"
					:style="{
						height: accessDeviceCheck == 'PC' ? '100%' : '100%',
						paddingTop: accessDeviceCheck == 'PC' ? '50px' : '10px',
					}"
				>
					<div
						class="col-12 row screenCaptureImg justify-center"
						style="width: 100%"
						:style="{ height: accessDeviceCheck == 'PC' ? '' : '100%' }"
					>
						<img
							:src="callStore.captureImageInfo.fileSrc"
							style="width: 100%; height: 100%"
						/>
					</div>
					<div
						v-if="accessDeviceCheck == 'PC'"
						class="row col-12 items-center justify-center pcScreenCaptureText"
						:style="{}"
					>
						<p class="msg alertText">{{ t("capture Image Save") }}</p>
					</div>
					<div
						v-if="accessDeviceCheck == 'PC'"
						class="alertControlbuttons pcScreenCaptureButtons"
						style="margin-top: 20px"
					>
						<button
							@click="captureSave(true)"
							class="hostRequestadelineButton"
						>
							{{ t("예") }}
						</button>
						<button
							@click="captureSave(false)"
							class="hostRequestadelineButton"
						>
							{{ t("아니오") }}
						</button>
					</div>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 15"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">{{ t("서버에 업로드 중입니다") }}</p>
					</div>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 16"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">{{ t("캡쳐하신 사진을 저장하였습니다") }}</p>
						<p class="msg alertText">{{ t("드로잉으로 이동하시겠습니까?") }}</p>
					</div>
				</div>
				<div class="alertControlbuttons" style="margin-top: 20px">
					<button
						@click.once="moveDrawingConfirm(true, 'capture')"
						class="hostRequestadelineButton"
					>
						{{ t("예") }}
					</button>
					<button
						@click.once="moveDrawingConfirm(false, 'capture')"
						class="hostRequestadelineButton"
					>
						{{ t("아니오") }}
					</button>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 17"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div
					class="row requestStatus alertRequestDeclineMessage HQCaptureText col-12"
				>
					<div class="col-12 HQCaptrueText">
						<p class="msg alertText">{{ t("메인화면 글라스에게 고화질 캡쳐를 요청하였습니다") }}</p>
						<p class="msg alertText">{{ t("잠시 후 고화질 캡쳐 사진이 자동으로 수신됩니다") }}</p>
					</div>
					<div
						class="row col-12 items-center justify-center HQCaptrueText"
						style="padding-top: 15px"
					>
						<p class="msg alertText">{{ t("이 창은 5초뒤에 자동으로 사라집니다") }}</p>
					</div>
				</div>
				<div class="alertControlbuttons" style="margin-top: 15px">
					<button @click="closeNoneOverlayAlert">{{ t("확인") }}</button>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 18"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">{{ t("고화질 캡쳐에 실패하였습니다") }}</p>
						<p class="msg alertText">{{ t("잠시 후 다시 시도해주세요") }}</p>
					</div>
				</div>
				<div class="alertControlbuttons" style="margin-top: 30px">
					<button @click="closeNoneOverlayAlert">{{ t("확인") }}</button>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 19"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">{{ t("자동 통화 종료를 설정하였습니다") }}</p>
						<p class="msg alertText">{{ t("잠시 후 통화가 종료 됩니다") }}</p>
					</div>
				</div>
				<div class="alertControlbuttons" style="margin-top: 30px">
					<p
						v-if="$callStore.autoDiscallingResult"
						class="msg alertText"
					>
						{{ t("잠시 후 통화가 종료 됩니다") }}
					</p>
					<button
						v-if="!$callStore.autoDiscallingResult"
						@click="autoDiscallingCancel"
					>
						{{ t("cancel") }}
					</button>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 20"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">
							{{ t("다른 장치에서 로그인 중입니다") }}
						</p>
						<p class="msg alertText">
							{{ t("강제 로그아웃하시겠습니까?") }}
						</p>
					</div>
				</div>
				<div class="alertControlbuttons" style="margin-top: 20px">
					<button @click="forceLogout(true)" class="hostRequestadelineButton">
						{{ t("예") }}
					</button>
					<button @click="forceLogout(false)" class="hostRequestadelineButton">
						{{ t("아니오") }}
					</button>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 21"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">
							{{ t("다른 기기에서 로그인 요청으로") }}
						</p>
						<p class="msg alertText">
							{{ t("자동으로 로그아웃됩니다") }}
						</p>
					</div>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 22"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">
							{{ t("요청한 기기가 영상통화중이므로") }}
						</p>
						<p class="msg alertText">
							{{ t("로그인할 수 없습니다") }}<br />{{
								t("잠시 후 다시 시도하십시오")
							}}
						</p>
					</div>
				</div>
			</div>
			<div
				v-if="noneOverlayAlertStatus == 23"
				class="row col-12 alertMessageBox items-center justify-center"
			>
				<div class="row requestStatus alertRequestDeclineMessage col-12">
					<div class="col-12">
						<p class="msg alertText">
							{{ t("강제 로그아웃 중입니다") }}
						</p>
						<p class="msg alertText">
							{{ t("잠시 기다려주십시오") }}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useCommonStore } from "@/stores";
import { useDrawingCanvasStore } from "@/stores/drawing";
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";

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
	let receiveRejectFlag = ''
	if (result) {
		callStore.setHangupCallingConfirmFlag(result);

		for (let i = 0; i < commonStore.userListStatus.length; i++) {
			// flag를 설정한다.
			if (commonStore.userListStatus[i].status == "sending") {
				// CallingCancel 존재하므로 전화 거절 처리
				callStore.setCancelCallFlag(true)
			}

			// vuex에 userListStatus 배열의 요소 중 status가 receive가 있는지 체크한다.
			if (commonStore.userListStatus[i].status == "receive") {
				// 멀티통화 거절
				callStore.setMultiCallingResult(0)
				receiveRejectFlag = true
			}

			// 파일 송수신 수락 대기 중인 것이 있는지 체크한다.
			if (commonStore.userListStatus[i].status == 2) {
				// 파일 송수신 거절 처리
				commonStore.setFileSendStatus(4)
				commonStore.setFileSendFlag(true)
			}
		}

		if (
			callStore.cancelCallFlag == true ||
			receiveRejectFlag == true
		) {
			// 바로 이동 시 처리해야할 것들을 처리 하지 못함 :: 수신 팝업 등
			setTimeout(function () {
				commonStore.janus.destroy()
			}, 500)
		} else {
			commonStore.janus.destroy()
		}
		meetingStore.setMeetingLeaveFlag(true)
		modalStore.closeModal("noneOverlayModal");
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

.noneOverayModalContainer {
    float: none !important;
    width: 100%;
    height: 100%;
    padding: 50px 37px;
	box-sizing: border-box;
	background-color: #262627;
	color: #fff;

	button {
		color: #fff;
	}
    @media all and (max-width: 767px) {
        padding: 20px 27px 50px 27px;
    }
}

.exclamationMarkImg {
    position: absolute;
    top: 2px;
    right: 29px;
    width: 131px;
}

.alertCloseBtn {
    position: absolute;
    top: 5px;
    right: 5px;
}

.alertCloseImg {
    width: 14px;
}

.alertTitle {
    font-size: 22px;
    font-weight: bolder;
    margin-left: 7px;
    margin-bottom: 3px;
}

.titleUnderLine {
    height: 1px;
    background: #3c3c3c;
    margin-top: 5px;
}

.msg {
    /* No specific styles defined in original .sass for .msg itself */
}

.alertMessageBox {
    text-align: center;
    height: 150px;
}

.requestStatus {
    padding-top: 30px;
    display: flex;
    justify-content: center;

    @media screen and (max-width: 479px) {
        padding: 10px;
    }

    > div {
        /* Original was commented out: */
        // &:first-child
        //   margin: auto
        // &:last-child
        //   width: auto
        //   margin: auto
    }
}

.alertText {
    font-size: 15px;
    line-height: 24px;
    word-break: keep-all !important;
}

.alertControlbuttons {
    margin: 0px 0px 3px 10px;
    width: inherit;
    display: flex;
    justify-content: center;
    height: 34px;
    // margin-left: 10px
    // margin: 0px auto;

    > button {
        padding: 6px 22px;
        margin-right: 10px;
        font-size: 13px;
        border-radius: 15px;

        &:first-child {
			background-color: #1c8eff;
        }

        &:last-child {
			background-color: #464646;
            /* No specific styles in original */
        }
    }
}

.screenCaptureImg {
    width: 100%;
    // height: 100%
    // max-width: 536px
    // max-height: 80%
    @media screen and (max-height: 530px) {
        margin: 0px auto !important;
        margin-left: auto;

        > img {
            height: 100%;
        }
    }
}

.HQCaptureText {
    margin-top: 12px;
}

@media screen and (max-height: 767px) {
    .mobileScreenCaptureText {
        font-size: 12px !important;
    }
    .mobileScreenCaptureButtons {
        margin: 0px 0px 0px 10px;

        > .hostRequestadelineButton {
            padding: 3px 15px !important;
            font-size: 12px !important;
            margin-right: 3px;
        }
    }
}

@media all and (max-width: 400px) {
    .noneOverayModalContainer {
        > div {
            &:first-child {
                display: grid;

                > div {
                    &:nth-child(2) {
                        display: flex;
                        height: fit-content;
                        justify-content: center;
                    }
                }
            }
        }
    }
    .mobileScreenCaptureButtons {
        padding-top: 10px;
        padding-bottom: 15px;
    }
    .HQCaptrueText {
        > p {
            font-size: 13px;
            word-break: keep-all;
        }

        > .alertControlbuttons {
            margin-top: 10px !important;
        }
    }
}
</style>
