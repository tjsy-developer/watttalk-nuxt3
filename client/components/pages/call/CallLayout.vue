<template>
    <div :style="{ maxWidth: 'inherit' }" class="aaa">
        <audio
            v-for="(window, windowKey) in roomNumberCount - 1"
            :id="`audioControl${windowKey}`"
            :key="windowKey"
            autoplay
        ></audio>

        <div :class="`callingLayout${callingLayoutType}`">
            <div
                v-for="(window, windowKey) in roomNumberCount - 1"
                v-show="
                    userList[windowKey]?.status !== 'none' &&
                    userList[windowKey]?.status !== 'main'
                "
                :key="windowKey"
                class="windowContainer"
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

        <!-- <div v-else-if="callingLayoutType === 3" class="row content-start callingLayout3">
            <div id="callingLayoutWrap3" class="col-auto column callingLayoutWrap3">
                <div class="callingLayoutForm">
                    <div
                        v-for="(window, windowKey) in roomNumberCount - 1"
                        v-show="userList[windowKey].status !== 'none'"
                        :key="windowKey"
                        class="col callingWindowContainer3"
                    >
                        <div
                            v-if="windowKey === 0"
                            id="videolocal"
                            :compData="userList[windowKey] || []"
                            :videoTag="callStore.videoTagArray[0]"
                            :stream="callStore.videoStreamArray[0]"
                            :value="windowKey"
                        >
                            <CallWindow />
                        </div>
                        <div
                            v-else
                            :id="`videoremote${windowKey}`"
                            :compData="userList[windowKey] || []"
                            :videoTag="callStore.videoTagArray[windowKey]"
                            :stream="callStore.videoStreamArray[windowKey]"
                            :value="windowKey"
                            :style="{ height: '105px', 'object-fit': 'cover' }"
                        >
                            <CallWindow />
                        </div>
                    </div>
                </div>
            </div>
            <div class="col z-index-1">
                <CallWindow
                    :compData="userList[roomNumberCount - 1] || []"
                    :calling-layout-type="callingLayoutType"
                >
                    <template #default>
                        <Thumbnail />
                    </template>
                </CallWindow>
            </div>
        </div>

        <div v-else-if="callingLayoutType === 4" class="row content-start callingLayout4">
            <div class="col-12 fullTrue">
                <CallWindow
                    :compData="userList[roomNumberCount - 1] || []"
                    :calling-layout-type="callingLayoutType"
                >
                    <template #default>
                        <Thumbnail />
                    </template>
                </CallWindow>
            </div>
            <button
                v-if="isShow"
                id="fixBtn"
                :style="{
                    position: 'absolute',
                    bottom: '179.5px',
                    left: showBtnWidth + 'px',
                }"
                class="memberFixBtn"
                @click="showMember"
            >
                <img
                    v-if="displayMode === 'darkmode'"
                    src="@/assets/images/calling/bt_default_2.png"
                />
                <img
                    v-else-if="displayMode === 'lightmode'"
                    src="@/assets/images/lightmode/underbar/bt_default_2.svg"
                />
                <img
                    id="upDownArrow"
                    v-if="displayMode === 'darkmode'"
                    src="@/assets/images/calling/ic_down_20.png"
                    class="upDownImg"
                />
                <img
                    id="upDownArrow"
                    v-else-if="displayMode === 'lightmode'"
                    src="@/assets/images/lightmode/underbar/ic_down_20.svg"
                    class="upDownImg"
                />
            </button>
            <button
                v-else
                id="fixBtn"
                :style="{
                    position: 'absolute',
                    bottom: '0px',
                    left: showBtnWidth + 'px',
                }"
                class="memberFixBtn"
                @click="showMember"
            >
                <img
                    v-if="
                        (underStatus === 0 || underStatus === 3) &&
                        displayMode === 'darkmode'
                    "
                    src="@/assets/images/calling/bt_default.png"
                />
                <img
                    v-else-if="
                        (underStatus === 0 || underStatus === 3) &&
                        displayMode === 'lightmode'
                    "
                    src="@/assets/images/lightmode/underbar/bt_default_2.svg"
                />
                <img
                    v-else-if="underStatus === 1 && displayMode === 'darkmode'"
                    src="@/assets/images/calling/bt_call.png"
                />
                <img
                    v-else-if="underStatus === 1 && displayMode === 'lightmode'"
                    src="@/assets/images/lightmode/underbar/bt_call.svg"
                />
                <img
                    v-else-if="underStatus === 2 && displayMode === 'darkmode'"
                    src="@/assets/images/calling/bt_file.png"
                />
                <img
                    v-else-if="underStatus === 2 && displayMode === 'lightmode'"
                    src="@/assets/images/lightmode/underbar/bt_file.svg"
                />
                <img
                    id="upDownArrow"
                    v-if="
                        (underStatus === 0 || underStatus === 3) &&
                        displayMode === 'darkmode'
                    "
                    src="@/assets/images/calling/ic_down_20.png"
                    style="transform: rotate(180deg)"
                    class="upDownImg"
                />
                <img
                    id="upDownArrow"
                    v-else-if="
                        (underStatus === 0 || underStatus === 3) &&
                        displayMode === 'lightmode'
                    "
                    src="@/assets/images/lightmode/underbar/ic_down_20.svg"
                    style="transform: rotate(180deg)"
                    class="upDownImg"
                />
                <img
                    v-else-if="underStatus === 1 && displayMode === 'darkmode'"
                    src="@/assets/images/calling/ic_call_20.png"
                    class="upDownImg upImg blinking"
                />
                <img
                    v-else-if="underStatus === 1 && displayMode === 'lightmode'"
                    src="@/assets/images/lightmode/underbar/ic_call_20.svg"
                    class="upDownImg upImg blinking"
                />
                <img
                    v-else-if="underStatus === 2 && displayMode === 'darkmode'"
                    src="@/assets/images/calling/ic_file_20.png"
                    class="upDownImg upImg blinking"
                />
                <img
                    v-else-if="underStatus === 2 && displayMode === 'lightmode'"
                    src="@/assets/images/lightmode/underbar/ic_file_20.svg"
                    class="upDownImg upImg blinking"
                />
            </button>
        </div> -->
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useCommonStore } from "@/stores";
import { useCallStore } from "@/stores/call";
import { useChattingStore } from "@/stores/chatting";
import CallWindow from "./CallWindow.vue";
import ThumbNail from "./drawing/ThumbNail.vue";
import { useSignallingSocket } from "@/composables/socket/useSignallingSocket";

const commonStore = useCommonStore();
const callStore = useCallStore();
const chattingStore = useChattingStore();

// Assuming callingWindow and thumbnail are components that Nuxt auto-imports
// from your components/ directory. If not, you might need to import them:

// import Thumbnail from '@/components/Thumbnail.vue';

// --- State (data equivalent) ---
const formWidhCallingLayout4 = ref("");
const isShow = ref(true);
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
        calcWidth(chattingStore.personnelInRoom);
    }
};

// --- Lifecycle Hooks (mounted equivalent) ---
onMounted(() => {
    // Dynamically import SASS/CSS is often handled differently in Nuxt 3/Vite.
    // For production, you typically import your styles directly in a <style> block
    // or via a Nuxt module (e.g., nuxt/modules/style-resources).
    // If this is for a specific, conditional style, you might need a different approach
    // or ensure the path is resolved correctly for Nuxt's build process.
    try {
        const displayModeSetting = sessionStorage.getItem("displayMode") || "darkmode";
        displayMode.value = displayModeSetting;
        // This `require` statement is for Nuxt 2 / Webpack.
        // For Nuxt 3 (Vite), dynamic imports usually look like this:
        // `import(`@/assets/styles/${displayModeSetting}/components/call/callingLayout/4.sass`)`
        // However, dynamic stylesheet loading at runtime is often discouraged.
        // Consider using CSS variables or class toggling for themes.
        // eval(`require('@/assets/styles/${displayModeSetting}/components/call/callingLayout/4.sass')`);
    } catch (e) {
        console.error("Failed to load stylesheet:", e);
    }

    // Initial width setup for layout 4
    if (callingLayoutType.value === 4) {
        formWidhCallingLayout4.value = roomNumberCount.value * 263.5 - 35;
        isShow.value = true;
        const fixBtn = document.getElementById("fixBtn");
        const wrapDiv = document.getElementById("fixBg");

        if (fixBtn) fixBtn.style.transition = "1s";

        // Ensure wrapDiv exists before accessing its clientWidth
        if (wrapDiv) {
            callingLayoutWrap4Width.value = wrapDiv.clientWidth;
            showBtnWidth.value = callingLayoutWrap4Width.value / 2 - 52;
        } else {
            console.warn("Element with id 'fixBg' not found during mount for layout 4.");
        }

        // nextTick(() => {
        //     window.addEventListener("resize", onResize);
        //     document.addEventListener("wheel", handleWheelScroll);
        // });
    }

    // Initial setup for layout 1
    if (callingLayoutType.value === 1) {
        window.addEventListener("resize", callingLayout1Resize);
    }

    // Socket.io setup
    // Nuxt 3 typically uses `useNuxtApp().$nuxtSocket` or imports directly
    // if you've configured a plugin. Assuming `@nuxtjs/websocket` or similar.
    const { signallingSocket } = useSignallingSocket(); // Get $nuxtSocket from Nuxt app instance

    signallingSocket.on("multiCalling", (response) => {
        if (response) {
            calcWidth(personnelInRoom.value + 1);
        }
    });
    signallingSocket.on("cancelCalling", (res) => {
        if (res) {
            calcWidth(personnelInRoom.value);
        }
    });

    const headerElement = document.getElementsByClassName("header")[0];
    if (headerElement) {
        headerHeight.value = headerElement.clientHeight + 10;
    } else {
        console.warn("Header element not found.");
    }
});

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

// --- Watchers ---
watch(roomNumberCount, () => {
    formWidhCallingLayout4.value = roomNumberCount.value * 263.5 - 35;
});

watch(callingLayoutType, (result) => {
    if (result === 4 && !isLayout4.value) {
        isLayout4.value = true;
        setTimeout(() => {
            formWidhCallingLayout4.value = roomNumberCount.value * 263.5 - 35;
            isShow.value = true;
            const fixBtn = document.getElementById("fixBtn");
            const wrapDiv = document.getElementById("fixBg");

            if (fixBtn) fixBtn.style.transition = "1s";

            if (wrapDiv) {
                callingLayoutWrap4Width.value = wrapDiv.clientWidth;
                showBtnWidth.value = callingLayoutWrap4Width.value / 2 - 53;
            } else {
                console.warn(
                    "Element with id 'fixBg' not found during callingLayoutType watch.",
                );
            }

            nextTick(() => {
                window.addEventListener("resize", onResize);
                document.addEventListener("wheel", handleWheelScroll);
            });
        }, 1000);
    } else if (result !== 4) {
        // Only run this block if changing *away* from layout 4
        // If you need specific cleanup when leaving layout 4 (e.g., removing listeners)
        // you should do it here if they were only added for layout 4.
        // Note: The previous logic had listeners removed in `beforeDestroy`,
        // which is covered by `onUnmounted` in Composition API.
        // If `isLayout4` only prevents re-initialization *within* layout 4,
        // then this branch resetting `timeKeeperBtn` and `isShow` is correct.

        timeKeeperBtn.value = false;
        isShow.value = true;
        nextTick(() => {
            calcWidth(personnelInRoom.value);
        });
        videoWidth.value =  "263.5px"
    }
});

watch(personnelInRoom, (res) => {
    calcWidth(res);
});

watch(getDeclineStatus, (res) => {
    if (res) {
        calcWidth(personnelInRoom.value);
        callStore.setDeclineStatus();
    }
});

watch(chattingShow, () => {
    const participantsCount = personnelInRoom.value; // Access the reactive computed ref
    calcWidth(participantsCount);
});

// --- Lifecycle Hooks (beforeDestroy equivalent) ---
onUnmounted(() => {
    window.removeEventListener("resize", onResize);
    window.removeEventListener("resize", callingLayout1Resize);
    document.removeEventListener("wheel", handleWheelScroll); // Remove the named function
});
</script>
<style lang="scss">
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
    width: 100%;
    height: 100%;
    padding: 5px;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    > .windowContainer {
        flex: 50%;
        aspect-ratio: 16 / 9;
        margin: 6.9px 12px;
        min-width: 315px;
        max-height: -webkit-fill-available;
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
    max-width: 227px;
    width: 227px;
    gap: 25px;
    box-sizing: content-box;
    /* bottom: 8px; */
    flex-direction: column;

    >.windowContainer {
        width: 227px !important;
        height: 150px;
        flex-shrink: 0;
    }
    [id^="videoremote"] {
        position: relative;
    }
}

.callingLayout4 {
    display: flex;
    align-items: center;
    /* padding-bottom: 52px; */
    height: 176px;
    background: rgba(60, 60, 60, 0.9);
    padding: 0 18px;
    border-radius: 13px;
    overflow: auto;
    max-width: 100%;
    width: -webkit-fill-available;
    position: absolute;
    gap: 10px;
    bottom: 8px;
    z-index: 1;
    > .windowContainer + .windowContainer {
        margin-left: 10px;
    }
    >.windowContainer {
        width: 227px !important;
        height: 150px;
        flex-shrink: 0;
    }
}

#mainVideo {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
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
</style>
