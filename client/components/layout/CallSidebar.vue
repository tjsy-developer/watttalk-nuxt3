<script setup>
import { commonToastMessage } from "@/composables/common";
import { useImageAssets } from "@/composables/useImageAssets";
import { useCommonStore } from "@/stores";
import { useCallStore } from "@/stores/call";
import { useChattingStore } from "@/stores/chatting";
import { useDrawingCanvasStore } from "@/stores/drawing";
import { useModalStore } from "@/stores/modal";
import { computed, ref } from "vue";
const { t } = useI18n();

const isMainMenuOpen = ref(false);
const isSubMenuOpen = ref(false);

const { menuImages } = useImageAssets();
const commonStore = useCommonStore();
const callStore = useCallStore();
const chattingStore = useChattingStore();
const modalStore = useModalStore();
const drawingStore = useDrawingCanvasStore();

const isHost = computed(() => chattingStore.videoCallHost);
const isDrawing = computed(() => commonStore.isDrawing);
const isHQCapture = computed(() => callStore.HQCaptureShow);
const isFileSend = computed(() => commonStore.fileModalFlag);
const isShare = computed(() => commonStore.isShare);
const isSoundMute = computed(() => commonStore.isSounded);
const isVideoOff = computed(() => commonStore.isVideo);

const getAllMicMuteFlag = computed(() => callStore.allMicMuteFlag);
const getCallingType = computed(() => callStore.callingType);
const getPersonnelInRoom = computed(() => chattingStore.personnelInRoom);
const getCallingPopupResult = computed(() => callStore.callingPopupResult);

function handleClickHangUp() {
    if (getCallingType.value == "videoCall") {
        // 통화 종료 확인 팝업
        commonStore.setNoneOverlayAlertStatus(4);
        modalStore.openModal("noneOverlayModal");
    } else if (
        getCallingType.value == "meetingCall" ||
        getCallingType.value == "joinGuestCall"
    ) {
        // 회의실 일 경우 혼자가 아닌 경우에는 항상 4번
        if (getPersonnelInRoom.value > 1) {
            // 통화 종료 확인 팝업
            commonStore.setNoneOverlayAlertStatus(4);
            modalStore.openModal("noneOverlayModal");
        } else if (getPersonnelInRoom.value == 1) {
            // 회의실 일 경우 혼자일 경우에는 항상 5번
            commonStore.setNoneOverlayAlertStatus(5);
            modalStore.openModal("noneOverlayModal");
        } else {
            console.log(
                "*** methods: cancelCallClick -> 현재 방에 입장한 사람이 없습니다.",
            );
        }
    }
}

function handleChangeVideoOnOff() {
    commonStore.setIsVideo();
}

function handleChangeMicOnOff() {
    if (!isHost.value && getAllMicMuteFlag.value && isSoundMute.value) {
        // 토스트 메세지 출력
        commonToastMessage(t("toastMessage MicPermissions"));
        return;
    }
    commonStore.setIsSounded();
    callStore.setMicOnOffClick(isSoundMute.value);

    const sfutest = commonStore.sfutest;

    let muted = sfutest.isAudioMuted();
    console.log(
        "*** methods: closeSounded status",
        (muted ? "Unmuting" : "Muting") + " local stream...",
    );
    if (muted) sfutest.unmuteAudio();
    else sfutest.muteAudio();
    muted = sfutest.isAudioMuted();
}

function handleChangeShareOnOff() {
    console.log(typeof isDrawing);
    if (isDrawing.value) {
        // 호스트만 화면공유를 이용할 수 있으므로, 호스트가 아닐 경우 무반응
        if (!isHost.value) {
            return;
        }
        commonStore.setNoneOverlayAlertStatus(13);
        return;
    }
    commonStore.setIsShare();
}
function handleClickHDVideoCapture() {
    console.log("*** methods: leftSideBar - HQvideoCapture")

    // 이전에 고화질 캡쳐 진행 중에는 못하도록 예외처리
    if (callStore.HQCaptureFlag) {
        commonToastMessage(t("toastMessage exist HQCapture"))
        return
    }

    // true 변경 시 calling에서 반응
    callStore.setHQCaptrueFlag(true)

    // 모달 출력 - 고화질 촬영을 요청하였습니다.
    commonStore.setNoneOverlayAlertStatus(17);
}

function handleClickVideoCapture() {
    if (!callStore.isCapture) {
        // localVideo = mainVideo Element
        console.log("*** methods: videoCapture");

        const captureCanvas = document.getElementById("captureCanvas");
        let mainVideoElement = document.getElementById("videoMain");

        if (commonStore.callingLayoutType == 1) {
            const mainVideoIdx = callStore.videoMainIndex
            if (mainVideoIdx == 0) {
                mainVideoElement = document.getElementById("myvideo")
            } else {
                mainVideoElement = document.getElementById("remotevideo" + mainVideoIdx)
            }
        }
        // mianVideo 돔과 mainVideo Src Object가 없을 경우는 실행하지 않는다.
        if (
            mainVideoElement != null &&
            captureCanvas != null &&
            mainVideoElement.srcObject != null
        ) {
            console.log("canvas = ", captureCanvas);

            // 메인 영상의 가로 세로 사이즈 만큼 캔버스의 크기 조정
            captureCanvas.width = mainVideoElement.videoWidth;
            captureCanvas.height = mainVideoElement.videoHeight;

            // 영상의 순간 이미지를 캔버스에 그림
            const canvasContext = captureCanvas.getContext("2d");
            canvasContext.drawImage(mainVideoElement, 0, 0);

            // 그린 image를 base64 얻어오기
            const imgDataUrl = captureCanvas.toDataURL("image/png", 1);
            // console.log("imgDataUrl = ", imgDataUrl)

            // base64 데이터 디코딩
            const blobBin = atob(imgDataUrl.split(",")[1]);
            const blobArray = [];
            for (let i = 0; i < blobBin.length; i++) {
                blobArray.push(blobBin.charCodeAt(i));
            }

            // Blob 생성
            const blobFile = new Blob([new Uint8Array(blobArray)], {
                type: "image/png",
            });

            // console.log("blobFile ", blobFile)

            /* 서버 업로드를 위한 파일 저장 */
            // 1) 받아온 base64 vuex에 저장한다.
            // 2) blob 처리 한 내용 중 size를 저장한다. blobFile.size
            // 3) fileName은 임의로 작성한다. (mainVideoCapture)
            callStore.setCaptureImageInfo({
                fileSrc: imgDataUrl,
                fileName: "mainVideoCpature.png",
                fileSize: blobFile.size,
            });

            // capture True 변경
            callStore.setIsCapture(true);

            // overlayModal 변경
            commonStore.setNoneOverlayAlertStatus(14);
        }
    }
}

function handleClickDrawingOnOff() {
    if (isShare.value) {
        // 호스트만 드로잉을 이용할 수 있으므로, 호스트가 아닐 경우 무반응
        if (!isHost.value) {
            return
        }

        commonStore.setNoneOverlayAlertStatus(12)
    }

    // 드로잉 종료
    if (isDrawing) {
        drawingStore.setBeforeCloseCanvas(false)
        drawingStore.setDrawingVideo(true)
        setTimeout(() => {
            commonStore.setIsDrawing(false)
            commonStore.setIsDrawingEnable(false)
        }, 300)
    }
    // 드로잉 시작
    else {
        console.log("드로잉 시작")
        commonStore.setIsDrawing(true)
        commonStore.setIsDrawingEnable(true)
        drawingStore.setDrawingVideo(false)
    }
}

function handleClickFileSend() {
    commonStore.setFileSendStatus(0)
    // 현재 내가 파일 송수신 진행 중일 경우 예외처리
    if (commonStore.userListStatus[0].status > 0) {
        return
    }

    modalStore.openModal("fileSend")
}
</script>

<template>
    <div class="leftbar end">
        <div
            v-if="isHost && !isDrawing && !isShare && isHQCapture"
            @click="handleClickHDVideoCapture"
            class="icon-btn func-img"
            :title="`${t('고화질 캡처')}`"
        >
            <img src="@/assets/images/leftSideBar/ic_capture_hd.png" />
        </div>
        <div
            v-if="isHost && !isDrawing && !isShare && !isHQCapture"
            @click="handleClickVideoCapture"
            class="icon-btn func-img"
            :title="`${t('화면 캡처')}`"
        >
            <img src="@/assets/images/leftSideBar/ic_capture.png" />
        </div>
        <div
            v-if="isHost"
            @click="handleClickDrawingOnOff"
            class="icon-btn func-img" :title="`${t('드로잉')}`">
            <img v-if="!isDrawing" key="" src="@/assets/images/leftSideBar/ic_drawing.png" />
            <img v-else src="@/assets/images/leftSideBar/ic_drawing_2.png" />
        </div>
        <div
            @click="handleClickFileSend" 
            class="icon-btn func-img" :title="`${t('파일 전송')}`">
            <img v-if="!isFileSend" src="@/assets/images/leftSideBar/ic_file.png" />
            <img v-else src="@/assets/images/leftSideBar/ic_file_2.png" />
        </div>
        <div
            v-if="isHost"
            @click="handleChangeShareOnOff"
            class="icon-btn func-img"
            :title="`${t('화면공유')}`"
        >
            <img v-if="!isShare" src="@/assets/images/leftSideBar/ic_share-1.png" />
            <img v-else src="@/assets/images/leftSideBar/ic_share_1.png" />
        </div>
        <div
            @click="handleChangeMicOnOff"
            class="icon-btn func-img"
            :title="`${isSoundMute ? t('내 마이크 활성화') : t('내 마이크 비활성화')}`"
        >
            <img v-if="!isSoundMute" src="@/assets/images/leftSideBar/ic_mic-large.png" />
            <img v-else src="@/assets/images/leftSideBar/ic_mute-large.png" />
        </div>
        <div
            @click="handleChangeVideoOnOff"
            class="icon-btn func-img"
            :title="`${isVideoOff ? t('내 화면 활성화') : t('내 화면 비활성화')}`"
        >
            <img v-if="!isVideoOff" src="@/assets/images/leftSideBar/ic_video.png" />
            <img v-else src="@/assets/images/leftSideBar/ic_video-2.png" />
        </div>
        <div
            @click="handleClickHangUp"
            class="icon-btn func-img"
            :title="`${t('통화종료')}`"
        >
            <img src="@/assets/images/leftSideBar/ic_hang-up.png" />
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
