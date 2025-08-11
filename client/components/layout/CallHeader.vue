<script setup>
import { onMounted, ref, watch } from "vue";
const { $colorMode } = useNuxtApp();
const { commonImages, headerImages } = useImageAssets();
import { iconKorea, iconSpain, iconUSA } from "@/assets/images/index";
import { useNuxtApp } from "nuxt/app";
import { useImageAssets } from "@/composables/useImageAssets";
import { useLoginStore } from "@/stores/login";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { useCallStore } from "@/stores/call";
import { useMeetingStore } from "@/stores/meeting";
import { useChattingStore } from "@/stores/chatting";
import { useCommonStore } from "@/stores";
import { commonToastMessage } from "@/composables/common";
import ContactList from "../pages/dashboard/ContactList.vue";

const loginStore = useLoginStore();
const callStore = useCallStore();
const chattingStore = useChattingStore();
const meetingStore = useMeetingStore();
const commonStore = useCommonStore();

const isOpen = ref(false);
const isOpenDisplay = ref(false);
const isOpenLanguage = ref(false);
const videoArray = ref([]);
const videoStream = ref([]);
// 컴포넌트 내부의 반응형 상태 (data 속성에 해당)
const curLang = ref("");
const chatBarStatus = ref(false); // chatBarStatus는 컴포넌트 내부에 정의되어 있다고 가정
const checked = ref(false); // sendDurationEnable과 연동될 checked 상태
const showContactList = ref(false);

const { t } = useI18n();

function handleChangeLayoutType(layoutType) {
    console.log(
        "*** methods: switchCallingLayoutType",
        callingLayoutType.value,
        layoutType,
    );

    // 변경되는 레이아웃이 현재 레이아웃과 동일하면 return
    if (callingLayoutType.value == layoutType) {
        return;
    }
    console.log("여기는");
    const videoMainIndex = callStore.videoMainIndex;
    if (callingLayoutType.value == 1 && layoutType !== 1) {
        if (videoMainIndex == 0) {
            document.getElementById("myvideo").style.scale = 1;
        } else {
            // 기존 레이아웃타입 1 ->  다른 레이아웃으로 변경됬을때
            document.getElementById("remotevideo" + videoMainIndex).style.scale = 1;
        }
    } else if (callingLayoutType.value !== 1 && layoutType == 1) {
        if (videoMainIndex == 0) {
            document.getElementById("myvideo").style.scale =
                commonStore.userListStatus[videoMainIndex].zoomLevel;
        } else {
            // 다른 레이아웃 타입 -> 레이아웃 1번으로 변경 시
            document.getElementById("remotevideo" + videoMainIndex).style.scale =
                commonStore.userListStatus[videoMainIndex].zoomLevel;
        }
    }
    console.log(commonStore.isDrawing);
    // 드로잉일 경우 레이아웃 변경 금지 : 변경 시 그림을 그려도 상대방에게 영상이 전송되지 않아서.
    if (commonStore.isDrawing) {
        commonToastMessage(t("toastMessage Drawing NoChangeLayout"));
        console.log("1");
        return;
    }

    // 낙하 모션 알람이 발생한 경우 레이아웃 변경 금지
    if (callStore.motionFallFlag) {
        commonToastMessage(t("toastMessage motionFall NoChangeLayout"));
        console.log("2");
        return;
    }

    // 움직임 없음 모션 알람이 발생한 경우 레이아웃 변경 금지
    if (callStore.motionNoMoveFlag) {
        console.log("3");
        commonToastMessage(t("toastMessage motionNoMove NoChangeLayout"));
        return;
    }

    // 레이저 포인터가 true 일경우 레이저포인터를 false로 바꾼다.
    if (callStore.laserPointerShow) {
        callStore.setLaserPointerShow(false);
    }

    console.log("여기탔어?>");
    // 변경될 때 마다 로컬 스토리지에 등록한다.
    localStorage.setItem("callingLayoutType", layoutType);

    // mask Show
    commonStore.setVideoLayoutChangeResult(true);

    videoArray.value = [];
    videoStream.value = [];
    // 이전 비디오 저장
    // for 조건 문 중 해당 기업의 최대 인원 수로 for문 조건
    // if (videoremote + i)의 dom이 없을 경우 break <-- break 하게 되면, 중간에 사람이 나가면 break 되므로 구현하지 않음.
    for (let i = 0; i < commonStore.roomNumberCount; i++) {
        if (i == 0) {
            videoArray.value[i] = document.getElementById("myvideo").outerHTML;
            videoStream.value[i] = document.getElementById("myvideo").srcObject;
        } else {
            const remoteElement = document.getElementById("remotevideo" + i);
            if (remoteElement != null && remoteElement.srcObject != null) {
                videoArray.value[i] = document.getElementById(
                    "panel-inner" + i,
                ).outerHTML;
                videoStream.value[i] = document.getElementById(
                    "remotevideo" + i,
                ).srcObject;
            }
        }
    }

    console.log("*** methods: switchCallingLayoutType save Video Info");

    callStore.setVideoInfoArray({
        videoTag: videoArray.value,
        videoStream: videoStream.value,
    });

    commonStore.changeLayoutType(layoutType);

    // location.reload()
}

onMounted(() => {
    console.log(headerImages);
});

const callingTimer = computed(() => callStore.callingTimer);
const callingLayoutType = computed(() => commonStore.callingLayoutType);

// computed 속성 변환
// mapState 대신 직접 스토어에서 상태를 가져와 computed로 감싸거나, storeToRefs 사용
const userInfo = computed(() => loginStore.userInfo);
const isContactListShow = computed(() => callStore.isContactListShow);
const lang = computed(() => loginStore.lang);
const nickname = computed(() => loginStore.nickname);
const callingType = computed(() => callStore.callingType);
const currentMeetingSubject = computed(() => meetingStore.currentMeetingSubject);
const connectionPathCheck = computed(() => callStore.connectionPathCheck); // callStore에 있다고 가정
const chattingMessageList = computed(() => chattingStore.chattingMessageList);
const sendDurationEnable = computed(() => callStore.sendDurationEnable);
const useVideoRecording = computed(() => callStore.useVideoRecording);
const isDrawing = computed(() => commonStore.isDrawing); // callStore에 있다고 가정
const isShare = computed(() => commonStore.isShare); // callStore에 있다고 가정
const devicedSelection = computed(() => callStore.devicedSelection); // callStore에 있다고 가정

// getLang computed 속성
const getLang = computed(() => {
    return loginStore.lang; // commonStore.login.lang 대신 loginStore.lang
});

// accessDeviceCheck computed 속성
const accessDeviceCheck = computed(() => {
    return callStore.accessDeviceCheck; // commonStore.accessDeviceCheck 대신 callStore.accessDeviceCheck
});

// watch 속성 변환
watch(getLang, (newResult, oldResult) => {
    console.log("*** watch: getLang");
    console.log("*** watch: before Lang : " + oldResult);
    console.log("*** watch: New Lang : " + newResult);
    if (newResult === "ko") {
        curLang.value = t("lang")[0]; // this.$t 대신 t 함수 사용
    } else {
        curLang.value = t("lang")[1]; // this.$t 대신 t 함수 사용
    }
});

watch(sendDurationEnable, (newVal) => {
    checked.value = newVal;
});

function handleChangeDrawingOnOff() {
    commonStore.setIsDrawing();
}

function handleChangeShareOnOff() {
    commonStore.setIsShare();
}

function toggleContactList() {
  showContactList.value = !showContactList.value
}
</script>

<template>
    <header>
        <div class="header-box">
            <div class="logo">
                {{ "여기 회의실 이름 넣기" }}
                <!-- <img :src="headerImages.logo" alt="Hyundai" style="height: 24px" /> -->
            </div>
            <div class="call-timer">
                <img src="@/assets/images/header/ic_call_16.png" class="icon" />
                <span>{{ callingTimer || "00:00:00" }}</span>
            </div>
            <div class="call-timer">
                <span v-if="sendDurationEnable" class="circle red"></span>
                <span v-else class="circle grey"></span>
                <span>REC</span>
            </div>
        </div>
        <div class="func-butttons">
            <button v-if="isDrawing" @click="handleChangeDrawingOnOff">
                <img
                    src="@/assets/images/attachment_header/ic_drawing.svg"
                    class="icon"
                />
                <span>{{ t("드로잉 종료") }}</span>
            </button>
            <button v-if="isShare" @click="handleChangeShareOnOff">
                <img src="@/assets/images/attachment_header/ic_screen.svg" class="icon" />
                <span>{{ t("화면공유 종료") }}</span>
            </button>
        </div>
        <div class="layout-butttons">
            <div>
                <button
                    :class="callingLayoutType == 1 ? 'clicked' : 'un-clicked'"
                    @click="toggleContactList"
                >
                    <img src="@/assets/images/header/ic_callbox_w.png"/>
                </button>
                <section class="right-panel" v-if="showContactList">
                    <ContactList></ContactList>
                </section>
            </div>
            <div>
                <button
                    @click="handleChangeLayoutType(1)"
                    :class="callingLayoutType == 1 ? 'active' : 'inactive'"
                >
                    <img src="@/assets/images/header/ic_4.png" />
                </button>
                <button
                    @click="handleChangeLayoutType(3)"
                    :class="callingLayoutType == 3 ? 'active' : 'inactive'"
                >
                    <img src="@/assets/images/header/ic_5.png" />
                </button>
                <button
                    @click="handleChangeLayoutType(4)"
                    :class="callingLayoutType == 4 ? 'active' : 'inactive'"
                >
                    <img src="@/assets/images/header/ic_6.png" />
                </button>
            </div>
            <div>
                <button :class="callingLayoutType == 1 ? 'clicked' : 'un-clicked'">
                    <img src="@/assets/images/darkmode/header/calling/ic_setup_btn.svg" />
                </button>
            </div>
        </div>
    </header>
</template>

<style lang="scss" scoped>
header {
    justify-content: space-between;
    * {
        color: #fff;
    }
}

.header-box {
    display: flex;
    column-gap: 10px;
}

.call-timer {
    background-color: #3b3b3b;
    display: flex;
    align-items: center;
    padding: 5px;
    border-radius: 5px;
    > span {
        font-weight: 600;
    }
}

.circle {
    display: inline-block;
    width: 9px;
    height: 9px;
    border-radius: 9px;
    margin-right: 5px;
    &.red {
        background-color: red;
    }
    &.grey {
        background: grey;
    }
}

.icon {
    width: 17px;
}

.func-butttons {
    display: flex;
    > button {
        display: flex;
        align-items: center;
        background-color: #d62424;
        border-radius: 15px;
        padding: 4px 9px;
        font-weight: 700;
        img + span {
            margin-left: 5px;
        }
        &:hover {
            background-color: rgb(245, 107, 107);
        }
    }
}

.layout-butttons {
    display: flex;
    height: 100%;
    position: relative;
    > button {
        box-sizing: inherit;
    }
    > div {
        display: flex;
        align-items: center;
    }
    /* *:not(.active, .inactive) {
        height: inherit;
    } */
    .clicked,
    .un-clicked {
        padding: 0;
        &:hover {
            background-color: rgba(0, 0, 0, 0.2);
        }
    }
    .inactive {
        opacity: 0.2;
        &:hover {
            opacity: 0.7;
        }
    }
}

.right-panel {
    width: 100%;
    max-width: 616px;
    height: 100%;
    max-height: 753px;
    padding: 41px 38px 8px 42px;
    z-index: 1;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    overflow-y: auto;
    position: absolute;
    right: 230px;
    bottom: 0;
    box-sizing: border-box;
    position: fixed;
    top: 50px;
    right: 46px;
    @include tc(background-color, "component-bg-color");
}
</style>
