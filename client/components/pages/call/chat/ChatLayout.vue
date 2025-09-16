<template>
    <div class="chat-container" :class="!isShowChatBar ? 'hidden' : ''">
        <button class="slide-btn" @click="isShowChatBar = !isShowChatBar">
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
                :class="{ hidden: !isShowChatBar }"
            />
            <img
                v-if="callStore.underStatus == 1"
                src="@/assets/images/calling/ic_call_20.png"
                class="chat-status"
                :class="{ blink: !isShowChatBar }"
            />
            <img
                v-if="callStore.underStatus == 2"
                src="@/assets/images/calling/ic_file_20.png"
                class="chat-status"
                :class="{ blink: !isShowChatBar }"
            />
            <img
                v-if="callStore.underStatus == 3"
                src="@/assets/images/calling/ic_text.png"
                class="chat-status"
                :class="{ blink: !isShowChatBar }"
            />
        </button>
        <div class="column content-start layout">
            <div class="col-auto chatTopButtonsContainer">
                <div class="participants-box">
                    <img src="@/assets/images/ic_people.png" />
                    <span class="participants"> {{ t("참여자") }} </span>
                    <span class="personnel"> ({{ personnelInRoom }}) </span>
                </div>
                <div>
                    <button
                        class="chatTopButtons entireMute"
                        @click="setAllMicMuteStatus(0)"
                        v-if="
                            allMicMuteStatus == 1 &&
                            videoCallHost &&
                            !micOnOffFlag &&
                            callingType != 'joinGuestCall'
                        "
                    >
                        <span>{{ t("전체음소거") }}</span>
                    </button>
                    <button
                        class="chatTopButtons entireMute"
                        @click="setAllMicMuteStatus(1)"
                        v-else-if="
                            allMicMuteStatus == 0 &&
                            videoCallHost &&
                            micOnOffFlag &&
                            callingType != 'joinGuestCall'
                        "
                    >
                        <span>{{ t("전체음소거 해제") }}</span>
                    </button>
                    <button
                        class="chatTopButtons hostRequest"
                        v-if="videoCallHost && callingType != 'joinGuestCall'"
                        style="cursor: default"
                    >
                        <img
                            src="@/assets/images/calling/ic_host.png"
                            style="width: 15px"
                        />
                        <span style="padding-left: 0px"> {{ t("호스트") }}</span>
                    </button>
                    <button
                        class="chatTopButtons hostRequest"
                        @click="hostRequest()"
                        style="margin-left: 79px"
                        v-else-if="!videoCallHost && callingType != 'joinGuestCall'"
                    >
                        <span>{{ t("호스트요청") }}</span>
                    </button>
                </div>
            </div>
        </div>
        <div class="col chattingBarMessageBoxContainer">
            <div class="chattingBarMessageBoxScroll" id="chattingBarMessageBoxScroll">
                <ChatView
                    v-for="(
                        chattingBarMessageBox, chattingBarMessageBoxKey
                    ) in chattingMessageList"
                    :key="chattingBarMessageBoxKey"
                    :compData="chattingBarMessageBox"
                />
            </div>
            <div
                class="col-auto chattingBarNewMessageBoxContainer"
                v-show="getNewMessageConfrim"
                @click="newMessageConfirm()"
            >
                <div
                    class="col-auto chattingBarNewBassageBox"
                    :style="{
                        backgroundColor: !getNewEmergencyConfirm ? '#2386D2' : 'red',
                    }"
                >
                    {{ t("신규 메시지가 존재합니다") }}
                </div>
            </div>
        </div>
        <div class="col-auto chattingBarSendMessageBoxContainer">
            <ChatSendBox />
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import ChatView from "@/components/pages/call/chat/ChatView.vue"; // Make sure to use .vue extension
import ChatSendBox from "@/components/pages/call/chat/ChatSendBox.vue";

import { useChattingStore } from "@/stores/chatting";
import { useCommonStore } from "@/stores";
import { useCallStore } from "@/stores/call";
import { useNuxtApp } from "nuxt/app";
const { t } = useI18n();

const chattingStore = useChattingStore();
const callStore = useCallStore();
const commonStore = useCommonStore();

const headerHeight = ref(0);
const isShowChatBar = ref(true);

const newMessageConfirm = () => {
    const scrollElement = document.getElementById("chattingBarMessageBoxScroll");
    if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
    }
    chattingStore.setNewMessageConfrim(false);
    chattingStore.setNewEmergencyConfirm(false);
};

const hostRequest = () => {
    callStore.setHostChangeRequest(true);
};

const setAllMicMuteStatus = (status) => {
    callStore.setAllMicMuteStatus(status);
};

const chattingMessageList = computed(() => chattingStore.chattingMessageList);
const getNewMessageConfrim = computed(() => chattingStore.newMessageConfrim);
const getNewEmergencyConfirm = computed(() => chattingStore.newEmergencyConfirm);
const videoCallHost = computed(() => chattingStore.videoCallHost);
const personnelInRoom = computed(() => chattingStore.personnelInRoom);
const allMicMuteStatus = computed(() => callStore.allMicMuteStatus);
// allMicMuteFlag is not used in the template, so it's commented out.
// const allMicMuteFlag = computed(() => callStore.allMicMuteFlag);
const micOnOffFlag = computed(() => callStore.micOnOffFlag);
const callingType = computed(() => callStore.callingType);
const accessDeviceCheck = computed(() => commonStore.accessDeviceCheck);

watch(
    () => getNewMessageConfrim,
    () => {},
);
onMounted(() => {
    const scrollElement = document.getElementById("chattingBarMessageBoxScroll");
    if (scrollElement) {
        scrollElement.addEventListener("scroll", () => {
            const scrollTop = scrollElement.scrollTop;
            const scrollHeight = scrollElement.scrollHeight;
            const clientHeight = scrollElement.clientHeight;

            const scrollLocation = scrollHeight - clientHeight;

            if (scrollTop >= scrollLocation - 50) {
                chattingStore.setNewMessageConfrim(false);
                chattingStore.setNewEmergencyConfirm(false);
            }
        });
    }
});
</script>

<style lang="scss" scoped>
.layout {
    width: 100%;
    * {
        color: #fff;
    }
}

.chat-container {
    display: flex;
    flex-direction: column;
    flex: 0 0 282px;
    background-color: #323232;
    position: relative;
    transform: translateX(0);
    opacity: 1;
}

.chat-container.hidden {
    transition:
        transform 0.3s ease,
        opacity 0.3s ease;
    transform: translateX(285px);
    opacity: 1;
    flex: 0;
    > div {
        display: none;
    }
}

.cancleCall {
    width: 100%;
    height: var(--header-height, 0);
}

.chattingBarMessageBoxContainer {
    width: 100%;
    padding: 10px;
    max-height: calc(100vh - 280px);
    height: 618px;
    color: #fff;
}

.chatTopButtonsContainer {
    font-size: 12px;
    padding: 10px 7px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    > div {
        display: flex;
    }
}

.chattingBarMessageBoxScroll {
    overflow-y: auto;
    height: 100%;
}

.chatTopButtonsContainer > img {
    width: 16px;
    margin-right: 2px;
    /* margin-top: 2px */
    margin-left: 7px;
}

.participants {
    /* margin-top: 5px */
    margin-right: 2px;
}

.personnel {
    /* margin-top: 5px */
}

.chatTopButtons {
    margin-left: 7px;
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 11px;
    display: flex;
    justify-content: center;
    background: #5d5d5d;
    border: 1px solid #393939;
}

.chatTopButtons > span {
    word-break: keep-all;
}

.chatTopButtons > img {
    margin-right: 4px;
}

.messageContainer {
    color: #fff;
    background-color: #474b4e;
    border: 1px solid #5d5d5d;
}

.participants-box {
    display: flex;
    width: max-content;
}

.slide-btn {
    position: absolute;
    top: 50%;
    right: 254px;
    transform: translate(-50%, -50%);
    cursor: pointer;
    z-index: 1;
}

.chat-status {
    position: absolute;
    top: 60px;
    right: 10px;
}

.chat-status.arrow {
    transform: rotate(0deg);
}

.chat-status.arrow.hidden {
    transform: rotate(180deg);
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
