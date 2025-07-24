<script setup lang="ts">

import { useImageAssets } from '@/composables/useImageAssets';
import { useCommonStore } from '@/stores';
import { useCallStore } from '@/stores/call';
import { useChattingStore } from '@/stores/chatting';
import { useModalStore } from '@/stores/modal';
import { computed, ref } from 'vue';

const isMainMenuOpen = ref(false);
const isSubMenuOpen = ref(false);

const { menuImages } = useImageAssets();
const commonStore = useCommonStore();
const callStore = useCallStore();
const chattingStore = useChattingStore();
const modalStore = useModalStore();

const isHost = computed(() => chattingStore.videoCallHost)
const isDrawing = computed(() => commonStore.isDrawing)
const isHQCapture = computed(() => callStore.HQCaptureShow)
const isFileSend = computed(() => commonStore.fileSend)
const isShare  = computed(() => commonStore.isShare)
const isSound = computed(() => commonStore.isSounded)
const isVideo = computed(() => commonStore.isVideo)

const getCallingType = computed(() => callStore.callingType);
const getPersonnelInRoom = computed(() => chattingStore.personnelInRoom);
const getCallingPopupResult = computed(() => callStore.callingPopupResult);

function handleClickHangUp() {

    if (getCallingType.value == "videoCall") {
        // 통화 종료 확인 팝업
        commonStore.setNoneOverlayAlertStatus(4)
        modalStore.openModal("noneOverlayModal")
    } else if (
        getCallingType.value == "meetingCall" ||
        getCallingType.value == "joinGuestCall"
    ) {
        // 회의실 일 경우 혼자가 아닌 경우에는 항상 4번
        if (getPersonnelInRoom.value > 1) {
            // 통화 종료 확인 팝업
            commonStore.setNoneOverlayAlertStatus(4)
            modalStore.openModal("noneOverlayModal")
        } else if (getPersonnelInRoom.value == 1) {
            // 회의실 일 경우 혼자일 경우에는 항상 5번
            commonStore.setNoneOverlayAlertStatus(5)
            modalStore.openModal("noneOverlayModal")
        } else {
            console.log(
                "*** methods: cancelCallClick -> 현재 방에 입장한 사람이 없습니다."
            )
        }
    }
}
</script>

<template>
    <div class="leftbar end">
        <div
            v-if="isHost && (!isDrawing && !isShare && isHQCapture)"
            class="icon-btn func-img" title="고화질 캡처">
            <img src="@/assets/images/leftSideBar/ic_capture_hd.png">
        </div>
        <div
            v-if="isHost && (!isDrawing && !isShare && !isHQCapture)"
            class="icon-btn func-img" title="화면 캡처">
            <img src="@/assets/images/leftSideBar/ic_capture.png">
        </div>
        <div
            v-if="isHost"
            class="icon-btn func-img" title="드로잉">
            <img src="@/assets/images/leftSideBar/ic_drawing.png">
        </div>
        <div class="icon-btn func-img" title="파일전송">
            <img src="@/assets/images/leftSideBar/ic_file.png">
        </div>
        <div
            v-if="isHost"
            class="icon-btn func-img" title="화면공유">
            <img src="@/assets/images/leftSideBar/ic_share-1.png">
        </div>
        <div class="icon-btn func-img" title="내 마이크 음소거">
            <img src="@/assets/images/leftSideBar/ic_mic-large.png">
        </div>
        <div class="icon-btn func-img" title="내 화면 활성화">
            <img src="@/assets/images/leftSideBar/ic_video.png">
        </div>
        <div class="icon-btn func-img" title="통화종료" @click="handleClickHangUp">
            <img src="@/assets/images/leftSideBar/ic_hang-up.png">
        </div>
        <div class="icon-btn func-img"></div>
        <audio id='calling_bell' loop style="display:none;">
            <source src="@/assets/sounds/Wood.ogg" type='audio/ogg' />
        </audio>
        <audio id='normal_message_bell' style="display:none; ">
            <source src="@/assets/sounds/normal_message.mp3" type='audio/mp3' />
        </audio>
        <audio id='emergency_message_bell' style="display:none; ">
            <source src="@/assets/sounds/emergency_message.mp3" type='audio/mp3' />
        </audio>
        <audio id='direct_message_bell' style="display:none; ">
            <source src="@/assets/sounds/goes-without-saying.ogg" type='audio/ogg' />
        </audio>
        <audio id='fileReceive_message_bell' style="display:none; ">
            <source src="@/assets/sounds/file-receive.wav" type='audio/wav' />
        </audio>
        <audio id='emergency_alarm_bell' style="display:none; ">
            <source src="@/assets/sounds/emergency_alarm.wav" type='audio/wav' />
        </audio>
    </div>
    <canvas id="videoNone" style="display:none;"></canvas>
</template>

