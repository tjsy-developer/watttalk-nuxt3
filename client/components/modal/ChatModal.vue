<script setup>
import useSocketEmitEvents from "@/composables/socket/useSocketEmit";
import { useDirectMessageStore } from "@/stores/directMessage";
import { useLoginStore } from "@/stores/login";
import { getFormattedDate } from "@/utils/common";
import { useNuxtApp } from "nuxt/app";
import { onMounted, ref } from "vue";
import { useVfm } from "vue-final-modal";
const { t } = useI18n();
import VueDragResize from "vue3-drag-resize";

const vfm = useVfm();
const {
    requestDirectMessage,
    requestDirectMessageReadProcess,
    requestGetPreviousMessage,
} = useSocketEmitEvents();
const props = defineProps(["remoteDeviceId", "remoteNickName", "profile"]);

console.log(props);
const directMessageStore = useDirectMessageStore();
const loginStore = useLoginStore();
const width = ref(0);
const height = ref(0);
const top = ref(0);
const left = ref(0);

const msg = ref("");
const sendBtn = ref(null);

onMounted(async () => {
    await nextTick();
    scrollToBottom();
});

function dragResize(newRect, event) {
    if (!newRect) return;
    width.value = newRect.width ?? 0;
    height.value = newRect.height ?? 0;
    top.value = newRect.top ?? 0;
    left.value = newRect.left ?? 0;
    console.log("drag", event);
}

async function sendMsg() {
    // type :: 0 발신, 1: 수신
    requestDirectMessage({
        receiver: props.remoteDeviceId,
        type: 0,
        message: msg.value,
        datetime: Math.floor(Date.now() / 1000),
    });
    directMessageStore.setRemoteMessageList({ remoteDeviceId: props.remoteDeviceId });
    directMessageStore.setAddSendMessage({
        sender: loginStore.m_local_deviceid,
        receiver: props.remoteDeviceId,
        timestamp: Math.floor(Date.now() / 1000),
        dateTime: getFormattedDate(Math.floor(Date.now() / 1000), "mm/dd hh:MM"),
        message: msg.value,
        read: false,
    });
    msg.value = "";
}

function readMsg() {
    requestDirectMessageReadProcess({
        sender: props.remoteDeviceId,
        receiver: loginStore.m_local_deviceid,
        datetime: Math.floor(Date.now() / 1000),
    });
    // directMessageStore.setReadMessage({ remoteDeviceId: props.remoteDeviceId });
}

function scrollToBottom() {
    setTimeout(() => {
        const chatSection = document.getElementById(
            "chat-section" + props.remoteDeviceId,
        );
        chatSection.scrollTop = chatSection.scrollHeight;
    }, 300);
}

function handleClickPrevMessage() {
    directMessageStore.setPrevMessageFocusUser(props.remoteDeviceId);
    directMessageStore.setRemoteMessageList({ remoteDeviceId: props.remoteDeviceId });
    requestGetPreviousMessage(props.remoteDeviceId);
}

function handleClickClose() {
    vfm.close("chat-modal-" + props.remoteDeviceId);
}

const targetMessageList = computed(() => {
    return (
        directMessageStore.openMessageList.find(
            (item) => item.remoteDeviceId === props.remoteDeviceId,
        )?.messageList || []
    );
});

const getIsLastMessage = computed(() => {
    return (
        directMessageStore.openMessageList.find(
            (item) => item.remoteDeviceId === props.remoteDeviceId,
        )?.isLastMessage || []
    );
});

watch(
    () => vfm.openedModals.map((m) => m.props?.modalId),
    (modalIds) => {
        const count = modalIds.filter((id) => id?.startsWith("chat-modal")).length;
        console.log("chat-modal로 시작하는 ID 개수:", count);
    },
);

watch(
    () => targetMessageList.value.length,
    async () => {
        await nextTick();
        scrollToBottom();
    },
);
</script>

<template>
    <ClientOnly>
        <VueDragResize
            :is-active="true"
            :w="350"
            :h="420"
            :x="0"
            :y="0"
            @resizing="dragResize"
            @dragging="dragResize"
        >
            <div class="modal-body">
                <div>
                    <div class="msg-target">
                        <img :src="props.profile" class="msg-profile" />
                        <span class="msg-nickname">{{ props.remoteNickName }}</span>
                    </div>
                    <img
                        :class="props.remoteDeviceId"
                        src="@/assets/images/ic_close.png"
                        @click.stop="handleClickClose"
                    />
                </div>
                <!-- vfm.close('chat-modal-' + props.remoteDeviceId) -->
                <section :id="'chat-section' + props.remoteDeviceId">
                    <button @click="handleClickPrevMessage" class="prev-msg-btn" v-if="getIsLastMessage !== true">
                        △{{ t("이전 메시지 보기") }}
                    </button>
                    <ul>
                        <li
                            v-for="msg in targetMessageList"
                            :key="msg.datetime"
                            class="chat-list"
                        >
                            <div
                                v-if="msg.sender != props.remoteDeviceId"
                                class="sender-msg"
                            >
                                <div class="read" v-if="!msg.read">1</div>
                                <div class="time">{{ msg.datetime }}</div>
                                <div class="msg">
                                    <div>
                                        <span>{{ msg.message }}</span>
                                    </div>
                                </div>
                            </div>
                            <div v-else>
                                <div class="reciever">
                                    {{ props.remoteNickName }}
                                </div>
                                <div class="reciever-msg">
                                    <div class="msg">
                                        <div>
                                            <span>{{ msg.message }}</span>
                                        </div>
                                    </div>
                                    <div class="time">{{ msg.datetime }}</div>
                                    <!-- <div class="read" v-if="!msg.read">1</div> -->
                                </div>
                            </div>
                        </li>
                    </ul>
                </section>
                <div class="msg-input">
                    <div>
                        <textarea
                            v-model="msg"
                            @focus="readMsg"
                            @keydown.enter="sendBtn.click()"
                            @mousedown.stop
                        ></textarea>
                        <button @click="sendMsg" ref="sendBtn">{{ t("전송") }}</button>
                    </div>
                </div>
            </div>
        </VueDragResize>
    </ClientOnly>
</template>

<style lang="scss" scoped>
.modal-body {
    border: 1px solid #4d4d4d;
    width: inherit;
    height: inherit;
    font-size: 14px;
    border-radius: 7px 7px 0 0;
    color: #d0d0d0;
    display: flex;
    flex-direction: column;
    > div:not(.msg-input) {
        z-index: 1;
        border-radius: inherit;
        background-color: #4d4d4d;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 4px;
    }
}
section {
    background-color: #393939;
    height: inherit;
    padding: 10px;
    overflow-y: auto;
    text-align: center;
    ul,
    li:first-child {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 7px;
        margin: 0;
        gap: 6px;
        list-style: none;
    }
    .notice.content span {
        display: inline-block; /* 또는 block */
        max-width: 300px; /* 줄일 폭 지정 */
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        vertical-align: middle; /* 선택 */
    }
}

.close-icon {
    cursor: pointer;
    margin-right: 5px;
}
.msg-target {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-left: 10px;
}
.msg-profile {
    width: 22px;
    height: 22px;
    border-radius: 30px;
    border: 1px soild #4d4d4d;
    background: #fff;
}

.msg-input {
    height: 83px;
    padding: 7px 3px;
    background-color: #4d4d4d;
    > div {
        display: flex;
        gap: 4px;
        height: 100%;
        > textarea {
            border-radius: 8px;
            padding: 5px;
            font-family: NanumSquare;
            font-size: 13px;
            background: #414141;
            color: #e3e3da;
            flex: 1;
        }
        > button {
            padding: 7px 15px;
            color: #fff;
            background-color: #8d8d8d;
            border-radius: 5px;
            &:hover {
                background-color: #019ed9;
            }
        }
    }
}
.chat-list {
    margin-bottom: 7px;
}

.sender-msg {
    display: flex;
    justify-content: right;
    align-items: end;
    gap: 4px;
    .msg {
        padding: 5px 10px;
        background: #1a8fff;
        border-radius: 6px;
        color: #fff;
        font-size: 11px;
        word-break: break-all;
    }
}

.reciever-msg {
    display: flex;
    justify-content: left;
    align-items: end;
    gap: 4px;
    .msg {
        padding: 5px 10px;
        background: #fff;
        border-radius: 6px;
        color: #000;
        font-size: 11px;
        word-break: break-all;
    }
}

.reciever {
    font-size: 12px;
    margin-bottom: 3px;
    margin-left: 3px;
    text-align: left;
}

.time {
    font-size: 11px;
}

.read {
    font-size: 11px;
    color: yellow;
}

.prev-msg-btn {
    background-color: #252525;
    color: #d0d0d0;
    border-radius: 11px;
    font-size: 12px;
    padding: 4px 8px;
    margin: auto;
}
</style>
