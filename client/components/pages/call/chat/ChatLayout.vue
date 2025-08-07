<template>
    <div class="chat-container">
        <div
            class="column content-start layout"
        >
            <div class="col-auto chatTopButtonsContainer">
                <div class="participants-box">
                    <img src="@/assets/images/ic_people.png" />
                    <span class="participants"> {{ t("참여자") }} </span>
                    <span class="personnel"> ({{ personnelInRoom }}) </span>
                </div>
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
                    <span>{{ t("전체음소거해제") }}</span> 
                </button>
                <button
                    class="chatTopButtons hostRequest"
                    v-if="videoCallHost && callingType != 'joinGuestCall'"
                    style="cursor: default"
                >
                    <img src="@/assets/images/calling/ic_host.png" style="width: 15px" />
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
                v-show="newMessageConfrim"
                @click="newMessageConfirm()"
            >
                <div
                    class="col-auto chattingBarNewBassageBox"
                    :style="{ backgroundColor: !newEmergencyConfirm ? '#2386D2' : 'red' }"
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
import { useI18n } from "vue-i18n";

const { t, locale: $i18nLocale } = useI18n();
// hostRequestModal component is not used in the template, so it's commented out.
// import hostRequestModal from "@/components/hostPermission.vue";

const chattingStore = useChattingStore();
const callStore = useCallStore();
const commonStore = useCommonStore();

const headerHeight = ref(0);

const newMessageConfirm = () => {
    const scrollElement = document.getElementById("chattingBarMessageBoxScroll");
    if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
    }
    chattingStore.newMessageConfrim(false);
    chattingStore.newEmergencyConfirm(false);
};

const hostRequest = () => {
    callStore.setHostChangeRequest(true);
};

const setAllMicMuteStatus = (status) => {
    callStore.setAllMicMuteStatus(status);
};

const chattingMessageList = computed(() => chattingStore.chattingMessageList);
const newMessageConfrim = computed(() => chattingStore.newMessageConfrim);
const newEmergencyConfirm = computed(() => chattingStore.newEmergencyConfirm);
const videoCallHost = computed(() => chattingStore.videoCallHost);
const personnelInRoom = computed(() => chattingStore.personnelInRoom);
const allMicMuteStatus = computed(() => callStore.allMicMuteStatus);
// allMicMuteFlag is not used in the template, so it's commented out.
// const allMicMuteFlag = computed(() => callStore.allMicMuteFlag);
const micOnOffFlag = computed(() => callStore.micOnOffFlag);
const callingType = computed(() => callStore.callingType);
const accessDeviceCheck = computed(() => commonStore.accessDeviceCheck);

onMounted(() => {

    const scrollElement = document.getElementById("chattingBarMessageBoxScroll");
    if (scrollElement) {
        scrollElement.addEventListener("scroll", () => {
            const scrollTop = scrollElement.scrollTop;
            const scrollHeight = scrollElement.scrollHeight;
            const clientHeight = scrollElement.clientHeight;

            const scrollLocation = scrollHeight - clientHeight;

            if (scrollTop >= scrollLocation - 50) {
                chattingStore.newMessageConfrim(false);
                chattingStore.newEmergencyConfirm(false);
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
    flex: 282px;
    background-color: #323232;
}
.cancleCall {
    width: 100%;
    /* $headerHeight would need to be a defined CSS variable or a static value if not using SASS compilation */
    height: var(
        --header-height,
        0
    ); /* Example: using CSS custom property for dynamic headerHeight */
}

.chattingBarMessageBoxContainer {
    width: 100%;
    padding: 10px;
    max-height: calc(100vh - 60px);
    height: 618px;
    color: #fff;
}

.chatTopButtonsContainer {
    font-size: 12px;
    padding: 10px 7px;
    display: flex;
    align-items: center;
    /* border-bottom: 2px solid #242424 */
}

.chattingBarMessageBoxScroll {
    overflow-y: scroll;
    height: inherit;
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
    /* width: 65px */
    width: 68px;
    margin-left: 7px;
    padding: 2px 0px;
    border-radius: 3px;
    font-size: 11px;
    display: flex;
    justify-content: center;
    background: #5d5d5d;
    border: 1px solid #393939;
}

.chatTopButtons > span {
    /* No specific styles defined here in your SASS */
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
</style>
