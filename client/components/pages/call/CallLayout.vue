<template>
    <div :style="{ maxWidth: 'inherit' }" class="aaa">
        <audio
            v-for="(window, windowKey) in roomNumberCount - 1"
            :id="`audioControl${windowKey}`"
            :key="windowKey"
            autoplay
        ></audio>

        <button class="slide-btn" @click="handleClickToggleUserBar">
            <img
                v-if="callStore.underStatus == 0 || callStore.underStatus == 3"
                src="@/assets/images/calling/right_bt_default.png"
            />
            <img
                v-if="callStore.underStatus == 1"
                src="@/assets/images/calling/right_bt_call.png"
            />
            <img
                v-if="callStore.underStatus == 2"
                src="@/assets/images/calling/right_bt_file.png"
            />

            <img
                v-if="callStore.underStatus == 0"
                src="@/assets/images/calling/ic_right_20.png"
                class="chat-status arrow"
                :class="{ hidden: !isShowCallingUser }"
            />
            <img
                v-if="callStore.underStatus == 1"
                src="@/assets/images/calling/ic_call_20.png"
                class="chat-status"
                :class="{ hidden: !isShowCallingUser }"
            />
            <img
                v-if="callStore.underStatus == 2"
                src="@/assets/images/calling/ic_file_20.png"
                class="chat-status"
                :class="{ hidden: !isShowCallingUser }"
            />
            <img
                v-if="callStore.underStatus == 3"
                src="@/assets/images/calling/ic_text.png"
                class="chat-status"
                :class="{ hidden: !isShowCallingUser }"
            />
        </button>
        <div
            :class="{
                ['callingLayout' + callingLayoutType]: true,
                hidden: !isShowCallingUser,
            }"
        >
            <div
                v-for="(window, windowKey) in roomNumberCount - 1"
                v-show="
                    userList[windowKey] &&
                    userList[windowKey]?.status !== 'none' &&
                    userList[windowKey]?.status !== 'main'
                "
                :key="windowKey"
                class="windowContainer"
                :class="{
                    mainVideoBorder:
                        getMainVideoIdx &&
                        userList[windowKey].userListIndex == getMainVideoIdx,
                    grid: callingLayoutType == 1,
                }"
            >
                <CallWindow
                    v-if="windowKey === 0"
                    :id="'videolocal'"
                    :compData="userList[windowKey] || []"
                    :value="windowKey"
                />
                <CallWindow
                    v-else-if="windowKey !== 0"
                    :id="`videoremote${windowKey}`"
                    :compData="userList[windowKey] || []"
                    :value="windowKey"
                />
            </div>
        </div>
        <CallWindow
            v-if="callingLayoutType !== 1"
            :id="'mainVideo'"
            :compData="userList[roomNumberCount - 1]"
            :value="windowKey"
        >
            <ThumbNail></ThumbNail>
        </CallWindow>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRoomStore } from "@/stores/room";
import { useCallStore } from "@/stores/call";
import { useChattingStore } from "@/stores/chatting";
import CallWindow from "./CallWindow.vue";
import ThumbNail from "./drawing/ThumbNail.vue";
import { useSignallingSocket } from "@/composables/socket/useSignallingSocket";

const commonStore = useRoomStore();
const callStore = useCallStore();
const chattingStore = useChattingStore();

const formWidhCallingLayout4 = ref("");
const isShowCallingUser = ref(true);
const allWidth = ref(0); // Initialized in onMounted
const callingLayoutWrap4Width = ref(null);
const showBtnWidth = ref(null);
const timeKeeperBtn = ref(false);
const isLayout4 = ref(false);
const mobileSubVideoShow = ref(false);
const headerHeight = ref(0);
const test = ref([]);
const videoWidth = ref("");
const videoHeight = ref("");
const displayMode = ref("darkmode");

const getMainVideoIdx = computed(() => commonStore.mainVideoIndex);
const userList = computed(() => commonStore.userListStatus);
const callingLayoutType = computed(() => commonStore.callingLayoutType);
const roomNumberCount = computed(() => commonStore.roomNumberCount);
const underStatus = computed(() => callStore.underStatus);
const personnelInRoom = computed(() => chattingStore.personnelInRoom);
const getDeclineStatus = computed(() => callStore.declineStatus);
const chattingShow = computed(() => chattingStore.chattingShow);
const getLoadingMask = computed(() => callStore.loadingMask);
const mainUser = computed(() => {
    return userList.value[commonStore.mainVideoIndex] || null;
});
// No need for separate computed properties like `getCallingLayoutType` etc.
// when directly using the computed refs from the store as above.

// --- Methods ---

// callingLayoutType이 1인 경우 영상 크기를 재 조정하는 함수
const calcWidth = (count) => {
    if (callingLayoutType.value !== 1) return;

    const container = document.getElementsByClassName("callingLayout1")[0];
    if (!container) {
        console.warn("Element with class 'callingLayout1' not found.");
        return;
    }

    const maxWidth = container.clientWidth;
    const maxHeight = container.clientHeight - 35; // header offset

    let videoPerRow = 2; // 한 줄에 2개씩
    let videoWidthCalc = maxWidth / videoPerRow;

    // 16:9 비율 적용
    let videoHeightCalc = (videoWidthCalc * 9) / 16;

    // 부모 높이 제한 적용
    if (videoHeightCalc > maxHeight / Math.ceil(count / videoPerRow)) {
        videoHeightCalc = maxHeight / Math.ceil(count / videoPerRow);
        videoWidthCalc = (videoHeightCalc * 16) / 9;
    }

    videoWidth.value = videoWidthCalc + "px";
    videoHeight.value = videoHeightCalc + "px";
};

const showMember = () => {
    if (commonStore.accessDeviceCheck === "PC") {
        const fixBg = document.getElementById("fixBg");
        const fixBtn = document.getElementById("fixBtn");
        const upDownArrow = document.getElementById("upDownArrow");

        if (!fixBg || !fixBtn || !upDownArrow) {
            console.warn(
                "Required elements (fixBg, fixBtn, upDownArrow) not found for PC logic.",
            );
            return;
        }

        if (!isShow.value && timeKeeperBtn.value) {
            fixBg.style.display = "";
            setTimeout(() => {
                fixBg.style.transition = "1s";
                fixBg.style.transform = "";
                fixBtn.style.transition = "1s";
                timeKeeperBtn.value = false;
                isShow.value = true;
            }, 0.001);
            if (underStatus.value === 0) {
                upDownArrow.style.transition = "1s";
            }
        } else if (isShow.value && !timeKeeperBtn.value) {
            fixBg.style.transition = "1s";
            fixBg.style.transform = "translate(0, 100%)";
            fixBtn.style.transition = "1s";
            isShow.value = false;
            setTimeout(() => {
                fixBg.style.display = "none";
                timeKeeperBtn.value = true;
            }, 1000.001); // Use a number for ms
            if (underStatus.value === 0) {
                upDownArrow.style.transition = "1s";
            }
        }
    } else {
        // Mobile
        const subVideoContainer = document.getElementsByClassName(
            "mobileSubVideoContainer",
        )[0];
        const mobileUpDownArrowIcon = document.getElementsByClassName(
            "mobileUpDownArrowIcon",
        )[0];

        if (!subVideoContainer || !mobileUpDownArrowIcon) {
            console.warn(
                "Required elements (mobileSubVideoContainer, mobileUpDownArrowIcon) not found for mobile logic.",
            );
            return;
        }

        if (mobileSubVideoShow.value) {
            mobileUpDownArrowIcon.style.transition = "0.5s";
            mobileUpDownArrowIcon.style.transform = "rotate(0deg)";
            subVideoContainer.style.transition = "1s";
            subVideoContainer.style.transform = "translate(0px, -50%)";
            mobileSubVideoShow.value = false;
        } else {
            mobileUpDownArrowIcon.style.transition = "0.5s";
            mobileUpDownArrowIcon.style.transform = "rotate(180deg)";
            subVideoContainer.style.transition = "1s";
            subVideoContainer.style.transform = "translate(198px, -50%)";
            mobileSubVideoShow.value = true;
        }
    }
};

// callingLayout이 4인 경우 타는 resize
const onResize = () => {
    allWidth.value = window.innerWidth;
    const width = allWidth.value - 337;
    if (callingLayoutType.value === 4) {
        setTimeout(() => {
            showBtnWidth.value = width / 2 + 65;
        }, 1001);
    }
};

// callingLayout이 1인 경우 타는 resize
const callingLayout1Resize = () => {
    if (callingLayoutType.value === 1) {
        function getCustomValue(n) {
            if (n % 2 === 0) {
                return n / 2;
            } else {
                return Math.floor(n / 2) + 2;
            }
        }
        const container = document.querySelector(".calling");
        const windowContainers = container.querySelectorAll(".grid");

        const cw = container.clientWidth - 16;
        const ch =
            window.innerHeight -
            50 -
            getCustomValue(chattingStore.personnelInRoom / 2) * 12;

        const cols = 2;
        const rows = 2;
        const ratio = 16 / 9;

        let itemWidth = cw / cols;
        let itemHeight = ch / rows;

        // 비율 유지 조정
        if ((itemWidth / ratio) * rows > ch) {
            itemHeight = ch / rows;
            itemWidth = itemHeight * ratio;
        } else {
            itemWidth = cw / cols;
            itemHeight = itemWidth / ratio;
        }

        windowContainers.forEach((el) => {
            el.style.width = `${itemWidth}px`;
            el.style.height = `${itemHeight}px`;
        });
    }
};

onMounted(() => {});

// Helper for the wheel event listener, to avoid inline function in removeEventListener
const handleWheelScroll = (e) => {
    // In Vue 3, e.path is deprecated. Use e.composedPath()
    const path = e.composedPath();
    if (!path || !Array.isArray(path)) {
        return;
    }

    let isThumb = false;
    const id = document.getElementById("fixBg");
    if (!id) return; // Exit if fixBg element is not found

    for (let i = 0; i < path.length; i++) {
        if (path[i] === id) {
            isThumb = true;
            break;
        }
    }

    if (isThumb) {
        id.scrollLeft += e.deltaY;
    }
};

const handleClickToggleUserBar = () => {
    isShowCallingUser.value = !isShowCallingUser.value;
    callStore.setUnderStatus(0);
};

// --- Watchers ---
watch(roomNumberCount, () => {
    formWidhCallingLayout4.value = roomNumberCount.value * 263.5 - 35;
});

watch(callingLayoutType, (result) => {});

watch(personnelInRoom, (res) => {
    callingLayout1Resize();
});

watch(getDeclineStatus, (res) => {
    if (res) {
        calcWidth(personnelInRoom.value);
        callStore.setDeclineStatus();
    }
});

watch(chattingShow, async () => {
    await nextTick();
    callingLayout1Resize();
});

// --- Lifecycle Hooks (beforeDestroy equivalent) ---
onUnmounted(() => {
    window.removeEventListener("resize", onResize);
    window.removeEventListener("resize", callingLayout1Resize);
    document.removeEventListener("wheel", handleWheelScroll); // Remove the named function
});
</script>
<style lang="scss" scoped>
.aaa {
    &::-webkit-scrollbar {
        width: 7px;
        height: 11px;
    }
    position: relative;
    display: flex;
}

.fit {
    span {
        font-size: 22px !important;
    }

    > .sending {
        > .sendingBackground {
            > .big {
                width: 8%;
                height: auto;
            }
        }
        > .otherBackground {
            > div {
                width: auto !important;
            }
            > .big {
                width: 8%;
                height: auto;
            }
        }
    }
    > .receive {
        > .receiveBackground {
            > .big {
                width: 8%;
                height: auto;
            }
            > .receiveBtnCallingLayoutType4,
            .receiveBtnCallingLayoutType3 {
                width: 85px;
                height: 32px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold; // Typo in original: should be font-weight
            }
        }
    }
}
.aaa {
    height: 100%;
}

.callingLayout1 {
    display: grid;
    grid-template-columns: repeat(2, auto);
    grid-auto-rows: 1fr;
    gap: 8px;
    width: 100%;
    height: inherit;
    box-sizing: border-box;
    place-items: center;
    justify-content: center;
    align-items: center;
    overflow-y: auto;
    overflow-x: hidden;
    > .windowContainer {
        min-width: 315px;
        max-height: -webkit-fill-available;
        aspect-ratio: 16 / 9;
        width: 100%;
        height: auto;
        background: #333;
        border-radius: 8px;
        object-fit: cover;
    }
}

.callingLayout3 {
    display: flex;
    align-items: center;
    /* padding-bottom: 52px; */
    height: 100%;
    background: rgba(60, 60, 60, 0.9);
    padding: 18px;
    border-radius: 13px;
    overflow: auto;
    max-width: 208px;
    width: 208px;
    flex: 0 0 208px;
    gap: 25px;
    box-sizing: content-box;
    /* bottom: 8px; */
    flex-direction: column;

    > .windowContainer {
        width: 208px !important;
        height: 117px !important;
        flex-shrink: 0;
    }
    [id^="videoremote"] {
        position: relative;
    }
}

.callingLayout4 {
    display: flex;
    align-items: center;
    height: 176px;
    background: rgba(60, 60, 60, 0.9);
    padding: 0 18px;
    border-radius: 13px;
    overflow: auto;
    max-width: 100%;
    width: -webkit-fill-available;
    position: absolute;
    gap: 10px;
    bottom: 0;
    z-index: 1;
    > .windowContainer + .windowContainer {
        margin-left: 10px;
    }
    > .windowContainer {
        width: 227px !important;
        height: 150px !important;
        flex-shrink: 0;
    }
}

.hidden {
    transition:
        transform 0.3s ease,
        opacity 0.3s ease;
    transform: translateY(176);
    opacity: 1;
    flex: 0;
    > div {
        display: none;
    }
}

#mainVideo {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    object-fit: fill;
    padding: 15px;
    > .videoMainWrap {
        line-height: 100%;
        margin: auto;
    }
}

.userWindow {
    width: 432px;
    height: 243px;
    margin: 10px;
}

#videolocal {
    border: 3px solid red;
    object-fit: cover;
    position: relative;
    box-sizing: border-box;
    > video {
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: fill;
    }
}

#panel-inner-main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    position: relative;
}

.screen-draw {
    // padding-top: 56.25%
    height: 100%;
    overflow: initial;
}
.screen-video {
    height: 0;
    overflow: hidden;
}

.fullFalse {
    height: 80% !important;
    padding-left: 130px;
}

.fullTrue {
    height: 100% !important;
    padding: 5px;
    // padding-left: 20px
}

.fullScreenClick {
    position: absolute;
    bottom: 5px;
    right: 10px;
}

.mouseOverClass {
    z-index: 99;
}

.slide-leave-active,
.slide-enter-active {
    transition: 1s;
}

.slide-enter {
    transform: translate(0, 100%);
}

.slide-leave-to {
    transform: translate(0, 100%);
}

.memberFixBtn {
    // z-index: 999
}
.fixOpacity {
    opacity: 0;
}
.upDownImg {
    position: absolute;
    left: 56px;
    bottom: 5px;
}

.blinking {
    -webkit-animation: blink 0.5s ease-in-out infinite alternate;
    -moz-animation: blink 0.5s ease-in-out infinite alternate;
    animation: blink 0.5s ease-in-out infinite alternate;
}

.z-index-1 {
    z-index: 1;
}
@-webkit-keyframes blink {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

@-moz-keyframes blink {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

@keyframes blink {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

.mobileLayout {
    > #callingLayoutWrap3 {
        &::-webkit-scrollbar-thumb {
            border-radius: 10px !important;
            position: absolute !important;
        }
    }
}

.fade-leave-active,
.fade-enter-active {
    transition: 1s;
}

.fade-enter {
    transform: translate(-190px, 0px);
    opacity: 1;
}
.fade-leave-to {
    transform: translate(-200px, 0%);
    opacity: 0;
}

.mobileUpDownArrowIcon {
    position: absolute;
    left: 20%;
    top: 43%;
}

.mainVideoBorder {
    border: 3px solid #f9f9f9;
}

.slide-btn {
    width: 100%;
    position: absolute;
    cursor: pointer;
    z-index: 1;
    bottom: 123px;
    display: flex;
    align-items: center;
    justify-content: center;
    > img {
        transform: rotate(90deg);
    }
}

.chat-status {
    position: absolute;
}

.chat-status.arrow.hidden {
    transform: rotate(270deg);
}

.blink {
    -webkit-animation: blink 0.5s ease-in-out infinite alternate;
    -moz-animation: blink 0.5s ease-in-out infinite alternate;
    animation: blink 0.5s ease-in-out infinite alternate;
}

@-webkit-keyframes blink {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

@-moz-keyframes blink {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

@keyframes blink {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
</style>
