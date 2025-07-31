<template>
    <div class="column content-start sendMessageBox">
        <div class="col-auto row justify-between line1">
            <div class="col row">
                <button
                    @click="switchMessageType(1)"
                    :style="{
                        backgroundColor:
                            messageType == 1 && displayType == 'darkmode'
                                ? '#7E7E7E'
                                : messageType == 1 && displayType == 'lightmode'
                                  ? '#D6D6D6'
                                  : displayType == 'darkmode'
                                    ? '#4D4D4D'
                                    : '#fff',
                    }"
                    class="normal"
                >
                    {{ t("일반") }}
                </button>
                <button
                    @click="switchMessageType(2)"
                    :style="{
                        backgroundColor:
                            messageType == 2
                                ? '#EE314A'
                                : displayType == 'lightmode'
                                  ? '#fff'
                                  : '#4D4D4D',
                        color:
                            messageType == 2 &&
                            (displayType == 'darkmode' || displayType == 'lightmode')
                                ? '#fff'
                                : displayType == 'darkmode'
                                  ? '#fff'
                                  : 'black',
                    }"
                    v-if="!videoCallHost"
                    class="emergency"
                >
                    {{ t("긴급") }}
                </button>
                <button
                    @click="switchMessageType(4)"
                    :style="{
                        backgroundColor:
                            messageType == 4 && displayType == 'darkmode'
                                ? '#7E7E7E'
                                : messageType == 4 && displayType == 'lightmode'
                                  ? '#D6D6D6'
                                  : displayType == 'darkmode'
                                    ? '#4D4D4D'
                                    : '#fff',
                    }"
                    v-if="videoCallHost && !isDrawing"
                    class="normal"
                >
                    {{ t("chatting move") }}
                </button>
                <button
                    @click="switchMessageType(5)"
                    :style="{
                        backgroundColor:
                            messageType == 5 && displayType == 'darkmode'
                                ? '#7E7E7E'
                                : messageType == 5 && displayType == 'lightmode'
                                  ? '#D6D6D6'
                                  : displayType == 'darkmode'
                                    ? '#4D4D4D'
                                    : '#fff',
                    }"
                    v-if="videoCallHost && !isDrawing"
                    class="emergency"
                >
                    {{ t("chatting direction") }}
                </button>
            </div>
            <div class="col-auto row justify-end iconContainer">
                <button
                    @click="switchMessageType(3)"
                    :style="{
                        backgroundColor:
                            messageType == 3
                                ? '#EE314A'
                                : displayType == 'lightmode'
                                  ? '#fff'
                                  : '#4D4D4D',
                    }"
                    v-if="videoCallHost && !isDrawing"
                    class="row justify-center items-center icon"
                >
                    <img
                        v-if="displayType == 'lightmode' && messageType != 3"
                        src="@/assets/images/lightmode/chattingbar/ic_alarm.svg"
                    />
                    <img v-else src="@/assets/images/messageBox/ic_alarm.png" />
                </button>
                <button
                    @click="switchMessageType(2)"
                    :style="{
                        backgroundColor:
                            messageType == 2
                                ? '#EE314A'
                                : displayType == 'lightmode'
                                  ? '#fff'
                                  : '#4D4D4D',
                        color:
                            messageType == 2 &&
                            (displayType == 'darkmode' || displayType == 'lightmode')
                                ? '#fff'
                                : displayType == 'darkmode'
                                  ? '#fff'
                                  : 'black',
                    }"
                    v-if="videoCallHost"
                    class="emergency"
                >
                    {{ t("emergency") }}
                </button>
            </div>
        </div>
        <div class="col row textareaContainer" v-if="messageType < 3">
            <button
                class="col-auto"
                id="focusTextAreaBack"
                v-if="view"
                style="background: #4a4a4a; width: 30px; font-size: 40px"
                @click="focusTextAreaBack"
            >
                ←
            </button>
            <textarea
                v-model="sendMessageText"
                @keyup.enter="makeEnterEvent"
                @focus="sendMessageTextfocus"
                class="col-12"
                id="sendMessageText"
            ></textarea>
            <button
                @click="sendMessage"
                :style="{ backgroundColor: messageType == 2 ? '#EE314A' : '#1c8eff' }"
                class="col-12 sendMessageBtn"
            >
                {{ t("send message") }}
            </button>
        </div>
        <div class="specific-message-box" v-else-if="messageType == 3">
            <div
                class="emergencyIconsContainer"
                v-for="(emergencyIcon, emergencyIconKey) in emergencyIconList"
                :key="emergencyIconKey"
                :style="{
                    backgroundColor: emergencyIconKey < 3 ? '#EB3149' : '#FF990F',
                }"
            >
                <button
                    @click="sendMessage(emergencyIconKey)"
                    class="emergencyIcon"
                >
                    <img :src="emergencyIcon.img" />
                    <span>{{ emergencyIcon.text }}</span>
                </button>
            </div>
        </div>
        <div class="specific-message-box" v-else-if="messageType == 4">
            <div
                class="arrowDiv arrowIconsContainer"
                v-for="(arrowIcon, arrowIconKey) in moveIconList"
                :key="arrowIconKey"
            >
                <button @click="sendMessage(arrowIconKey)" class="arrowIcon">
                    <img :src="arrowIcon.img" />
                    <span>{{ arrowIcon.text }}</span>
                </button>
            </div>
        </div>
        <div class="specific-message-box" v-else-if="messageType == 5">
            <div
                class="arrowDiv arrowIconsContainer"
                v-for="(arrowIcon, arrowIconKey) in directionIconList"
                :key="arrowIconKey"
            >
                <button @click="sendMessage(arrowIconKey)" class="arrowIcon">
                    <img :src="arrowIcon.img" />
                    <span>{{ arrowIcon.text }}</span>
                </button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n"; // For translations
import { useChattingStore } from "@/stores/chatting";
import { useCallStore } from "@/stores/call";

const chattingStore = useChattingStore();
const callStore = useCallStore();
const commonStore = useCommonStore();

const { t, locale: $i18nLocale } = useI18n(); // Access translation function and current locale

// Reactive state (formerly 'data' in Options API)
const messageType = ref(1);
const isCommandTooltip = ref(false); // This seems to be commented out in template, consider removal if unused
const sendMessageText = ref("");
const sendArrowMessage = ref(""); // Not used in template, consider removal if unused
const windowHeight = ref(typeof window !== "undefined" ? window.innerWidth : 0); // Initialize with window.innerWidth if client-side
const view = ref(false);
const displayType = ref("lightmode"); // Default, will be updated in onMounted

// Computed properties (formerly 'computed' in Options API and mapState)
const videoCallHost = computed(() => chattingStore.videoCallHost);
const callingLayoutType = computed(() => commonStore.callingLayoutType); // Assuming this is directly in root state
const callingType = computed(() => callStore.callingType); // Assuming this is in 'call' module
const isDrawing = computed(() => commonStore.isDrawing); // Assuming this is directly in root state
const accessDeviceCheck = computed(() => commonStore.accessDeviceCheck); // Assuming this is directly in root state

// Inline Arrays for v-for with image paths
// Using new URL(...) for asset paths is critical in Nuxt 3/Vite
const emergencyIconList = computed(() => [
    {
        img: new URL("@/assets/images/messageBox/ic_fire.png", import.meta.url).href,
        text: t("fire"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_emergency.png", import.meta.url).href,
        text: t("emergencies"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_ax.png", import.meta.url).href,
        text: t("accident"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_car.png", import.meta.url).href,
        text: t("patient transportation"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_hand.png", import.meta.url).href,
        text: t("work order"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_check.png", import.meta.url).href,
        text: t("on-site confirmation"),
    },
]);

const moveIconList = computed(() => [
    {
        img: new URL("@/assets/images/messageBox/ic_move_up.png", import.meta.url).href,
        text: t("chatting up"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_move_left.png", import.meta.url).href,
        text: t("chatting left"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_move_front.png", import.meta.url)
            .href,
        text: t("chatting front"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_move_down.png", import.meta.url).href,
        text: t("chatting down"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_move_right.png", import.meta.url)
            .href,
        text: t("chatting right"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_move_back.png", import.meta.url).href,
        text: t("chatting back"),
    },
]);

const directionIconList = computed(() => [
    {
        img: new URL("@/assets/images/messageBox/ic_direction_up.png", import.meta.url)
            .href,
        text: t("chatting up"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_direction_left.png", import.meta.url)
            .href,
        text: t("chatting left"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_direction_front.png", import.meta.url)
            .href,
        text: t("chatting front"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_direction_down.png", import.meta.url)
            .href,
        text: t("chatting down"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_direction_right.png", import.meta.url)
            .href,
        text: t("chatting right"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_direction_back.png", import.meta.url)
            .href,
        text: t("chatting back"),
    },
]);

// Methods
const switchMessageType = (e) => {
    messageType.value = e;
};

// Helper function to get world time (assuming it's a global helper or in another file)
// You might need to import or define this function based on where it truly resides.
const getWorldTime = () => {
    // Placeholder - replace with your actual implementation
    // Example: return new Date().toISOString();
    return new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

// Helper function to get chatting time zone (assuming it's a global helper or in another file)
// You might need to import or define this function based on where it truly resides.
const getChattingTimeZone = (dateString) => {
    // Placeholder - replace with your actual implementation for time zone conversion
    // Example: return new Date(dateString).toLocaleTimeString();
    return dateString; // For now, just return as is
};

const sendMessage = (iconKey) => {
    // 메시지 전송 시 필요한 데이터
    // my nickname, date, message, isReceived: true, type, Key -- messageType 3 == emergency Icons Index

    // sendMessageFlag 초기화
    chattingStore.setSendMessageFlag(false);

    // UTC Date 생성
    const nowDate = getWorldTime();

    if (messageType.value === 2) {
        // emergency
        const text = document.getElementById("sendMessageText").value.trim();
        if (text.length === 0) {
            sendMessageText.value = "";
            return;
        }
        chattingStore.sendMessage({
            nickname: sessionStorage.getItem("m_nickname"),
            date: nowDate,
            chattingDate: getChattingTimeZone(nowDate),
            message: sendMessageText.value,
            level: 0,
            type: 0, // Assuming type 0 for emergency text
        });
    } else if (messageType.value === 3) {
        // icon Message : emergencyIcons
        chattingStore.sendMessage({
            nickname: sessionStorage.getItem("m_nickname"),
            date: nowDate,
            chattingDate: getChattingTimeZone(nowDate),
            message: iconKey + 1, // Pass the icon index
            level: 0,
            type: 1, // Assuming type 1 for emergency icons
        });
    } else if (messageType.value === 4) {
        // icon Message : Move Icon
        chattingStore.sendMessage({
            nickname: sessionStorage.getItem("m_nickname"),
            date: nowDate,
            chattingDate: getChattingTimeZone(nowDate),
            message: iconKey + 1, // Pass the icon index
            level: 1,
            type: 2, // Assuming type 2 for move icons
        });
    } else if (messageType.value === 5) {
        // icon Message : Direction Icon
        chattingStore.sendMessage({
            nickname: sessionStorage.getItem("m_nickname"),
            date: nowDate,
            chattingDate: getChattingTimeZone(nowDate),
            message: iconKey + 1, // Pass the icon index
            level: 1,
            type: 4, // Assuming type 4 for direction icons
        });
    } else {
        // normal
        const text = document.getElementById("sendMessageText").value.trim();
        if (text.length === 0) {
            sendMessageText.value = "";
            return;
        }
        chattingStore.sendMessage({
            nickname: sessionStorage.getItem("m_nickname"),
            date: nowDate,
            chattingDate: getChattingTimeZone(nowDate),
            message: sendMessageText.value,
            level: 1,
            type: 0, // Assuming type 0 for normal text
        });
    }

    // 즉시 실행 시 element Heigh가 변경 되지 않아 감지 불가능
    setTimeout(() => {
        const scrollElement = document.getElementById("chattingBarMessageBoxScroll");
        if (scrollElement) {
            // Add null check for scrollElement
            scrollElement.scrollTop = scrollElement.scrollHeight;
        }
    }, 100);

    if (accessDeviceCheck.value === "Mobile") {
        focusTextAreaBack();
    }

    sendMessageText.value = ""; // sendMessage 초기화
    chattingStore.setSendMessageFlag(true); // sendMessageFlag 변경 (calling : socket 통신)
};

const makeEnterEvent = (event) => {
    if (event.key === "Enter") {
        console.log("*** methods: chatting makeEnterEvent");
        if (!event.shiftKey) {
            // key up 이기 때문에 enter 입력 시 enter가 하나 더 들어가기 때문에 하나 삭제.
            if (sendMessageText.value.length > 0) {
                sendMessageText.value = sendMessageText.value.slice(0, -1);
                sendMessage(); // Call sendMessage without arguments
            }
        }
    }
};

const sendMessageTextfocus = (event) => {
    console.log(window.innerWidth);
    if (window.innerWidth < 1023 && accessDeviceCheck.value === "Mobile") {
        console.log(event);
        view.value = true;
        event.target.style.width = "85%";
        event.target.parentElement.style =
            "position: fixed; left: 0px; top: 0px; z-index: 3; height: 100vh;";
        const sendMessageBtn = document.getElementsByClassName("sendMessageBtn")[0];
        if (sendMessageBtn) {
            // Add null check
            sendMessageBtn.classList.remove("col-12");
            sendMessageBtn.classList.add("col");
            sendMessageBtn.style.marginLeft = "0px";
        }
    }
};

const focusTextAreaBack = () => {
    if (window.innerWidth < 1023 && accessDeviceCheck.value === "Mobile") {
        view.value = false;
        const chatFocusEle = document.getElementById("sendMessageText");
        const sendMessageBtn = document.getElementsByClassName("sendMessageBtn")[0];
        if (chatFocusEle) chatFocusEle.style.width = "69%";
        if (sendMessageBtn) {
            sendMessageBtn.classList.remove("col");
            sendMessageBtn.classList.add("col-12");
            sendMessageBtn.style.marginLeft = "3px";
        }
        if (chatFocusEle && chatFocusEle.parentElement) {
            // Add null check for parentElement
            chatFocusEle.parentElement.style =
                "position: initial; left: initial; top: initial; z-index: initial; height: initial;";
        }
    }
};

// Watchers
watch(isDrawing, (result) => {
    // 드로잉 켰을 때 > 메세지 타입이 아이콘일 경우 일반으로 변경한다.
    if (result) {
        if ([3, 4, 5].includes(messageType.value)) {
            messageType.value = 1;
        }
    }
});
</script>

<style lang="scss" scoped>
.sendMessageBox {
    width: 100%;
    height: 100%;

    > div {
        width: 100%;
    }
}

$line1Height: 26px;

.line1 {
    height: $line1Height;
    font-size: 12px;
    // z-index: 1; // Unlikely to be needed if parent has z-index
}

.normal {
    &:first-child {
        margin-right: 2px;
    }
}

.normal,
.emergency {
    font-size: 12px;
    padding: 0 10px;
    border-radius: 2px;
}

.emergency {
    margin-left: 2px;
}

.iconContainer {
    height: 100%;
}

.icon {
    width: $line1Height;
    height: 100%;

    &:last-child {
        margin-left: 2px;
    }
}

.command {
    position: absolute;
    top: $line1Height + 2px;
    right: 0;
    padding: 2px 4px;
    font-size: 12px;

    > span {
        cursor: default;
    }
}

.textareaContainer {
    padding-top: 2px;

    > textarea {
        padding: 8px;
        height: 133px; // Explicit height for textarea, ensure it plays well with mobile focus logic
        margin-bottom: 3px;
    }
}

.sendMessageBtnContainer {
    height: 36px;
    padding-top: 3px;
}

.sendMessageBtn,
.mobileSendMessageBtn,
.selectedWindowSendMessageBtn {
    font-size: 14px;
    height: auto;
    padding: 0; // Corrected from `px`
    color: #fff;
}

.emergencyIcon {
    width: 100%;
    height: 100%;
}

.arrowIcon {
    width: 100%;
    height: 100%;

    > span {
        font-size: 12px;
        font-weight: bold;
    }
}

.specific-message-box {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    padding: 2px 0;
    > div {
        flex: 0 0 calc((100% - 2 * 2px) / 3);
        padding: 10px 0;
    }
    > .emergencyIconsContainer,
    .arrowIconsContainer {
        > button {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            > img {
                width: 38px;
                height: 38px;
            }
            > span {
                font-size: 10px;
                color: #fff;
                font-weight: 500;
            }
        }
    }
}

/* 모바일 가로, 테블릿 세로 (해상도 ~ 1023px)*/
@media all and (max-width: 1023px) {
    .emergencyIconsContainer {
        padding-top: 2px;
        height: auto;
        > button {
            > img {
                width: 28px;
            }
            > span {
                font-size: 12px;
                padding-top: 4px;
            }
        }
        &:nth-child(5) {
            > button {
                padding-top: 0px !important; // Override specific padding for 5th child
            }
        }
    }

    .emergencyIcon {
        > img {
            width: 25px;
            height: 25px;
            margin-top: 5px;
        }
        > span {
            font-size: 11px;
            font-weight: bold;
            padding-top: 5px;
            padding-bottom: 5px;
        }
    }

    .arrowIconsContainer {
        height: 44px;
    }

    .arrowIcon {
        > img {
            width: 25px;
        }
        > span {
            font-size: 12px;
            font-weight: bold;
        }
    }

    .textareaContainer {
        > textarea {
            width: 69%;
            height: auto !important;
            margin-bottom: initial; // Reset margin-bottom
        }
        > button {
            width: calc(30% - 1px);
            font-size: 12px;
            border-radius: 2px;
            margin-left: 3px;
            height: auto;
        }
    }

    .line1 {
        height: 23px;
        font-size: 11px;
    }
}
</style>
