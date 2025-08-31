<script setup>
import useSocketEmitEvents from "@/composables/socket/useSocketEmit";
import { useDirectMessageStore } from "@/stores/directMessage";
import { useLoginStore } from "@/stores/login";
import { getFormattedDate } from "@/utils/common";
import { useNuxtApp } from "nuxt/app";
import { onMounted, ref } from "vue";
import { useVfm } from "vue-final-modal";
const { $t } = useNuxtApp()
import VueDragResize from "vue3-drag-resize";

const vfm = useVfm();
const { requestDirectMessage, requestDirectMessageReadProcess } = useSocketEmitEvents();
const props = defineProps(["remoteDeviceId", "remoteNickName", "profile"]);

console.log(props);
const directMessageStore = useDirectMessageStore();
const loginStore = useLoginStore();
const width = ref(0);
const height = ref(0);
const top = ref(0);
const left = ref(0);

const msg = ref('');
const sendBtn = ref(null);
const noticeList = ref([]);


function dragResize(newRect) {
    width.value = newRect.width;
    height.value = newRect.height;
    top.value = newRect.top;
    left.value = newRect.left;
    console.log("drag");
}

async function sendMsg() {
	// type :: 0 발신, 1: 수신
	requestDirectMessage({
		receiver: props.remoteDeviceId,
		type: 0,
		message: msg.value,
		datetime: Math.floor(Date.now() / 1000)
	})
	directMessageStore.setRemoteMessageList({ remoteDeviceId: props.remoteDeviceId });
	directMessageStore.setAddSendMessage({
		sender: loginStore.m_local_deviceid,
		receiver: props.remoteDeviceId,
		timestamp: Math.floor(Date.now() / 1000),
		dateTime: getFormattedDate(Math.floor(Date.now() / 1000)),
		message: msg.value,
		read: false,
	})
	msg.value =''
}

function readMsg() {
	requestDirectMessageReadProcess({
		receiver: props.remoteDeviceId,
		datetime: Math.floor(Date.now() / 1000)
	})
	directMessageStore.setReadMessage({remoteDeviceId: props.remoteDeviceId})
}
const targetMessageList = computed(() => {
  return directMessageStore.openMessageList.find(
    item => item.remoteDeviceId === props.remoteDeviceId
  )?.messageList || []
})
console.log(targetMessageList)

const isFetching = ref(false);
let prevIsNoticeOpen = false;

watch(
    () => vfm.openedModals.map((m) => m.props?.modalId),
    (modalIds) => {
        const count = modalIds.filter((id) => id?.startsWith("chat-modal")).length;
        console.log("chat-modal로 시작하는 ID 개수:", count);
    },
);
</script>

<template>
    <ClientOnly>
        <VueDragResize
            :is-active="true"
            :w="350"
            :h="420"
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
                        class="close-icon"
                        src="@/assets/images/ic_close.png"
                        @click="vfm.close('chat-modal-' + props.remoteDeviceId)"
                    />
                </div>
                <section>
                    <ul >
                        <li :class="msg.sender !== props.remoteDeviceId ? 'sender-msg' : 'receiver-msg'" v-for="msg in targetMessageList" :key="msg.datetime" >
                            <div class="notice content">
                                <div>
                                    <span>{{ msg.message }}</span>
                                </div>
                            </div>
                            <div class="notice time">{{ msg.datetime }}</div>
                        </li>
                    </ul>
                </section>
                <div class="msg-input">
                    <div>
                        <textarea v-model="msg" @focus="readMsg" @keydown.enter="sendBtn.click()" @mousedown.stop ></textarea>
                        <button @click="sendMsg" ref="sendBtn">{{ $t("전송") }}</button>
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
        height: 45px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 4px;
    }
}
section {
    background-color: #262627;
    height: inherit;
    padding: 10px;
    ul,
    li:first-child {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 7px;
        margin: 0;
        gap: 6px;
        list-style: none;
        background-color: #353535;
        cursor: pointer;
        &:hover {
            background-color: #000;
            * {
                background-color: #000;
            }
        }
    }

    .notice.content {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        > div {
            gap: 8px;
            display: flex;
        }
    }
    .notice.content span {
        display: inline-block; /* 또는 block */
        max-width: 300px; /* 줄일 폭 지정 */
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        vertical-align: middle; /* 선택 */
    }
    .notice.time {
        font-size: 13px;
        color: #8d8d8d;
    }
    .notice.full-content {
        padding: 7px;
        line-height: 1.5;
    }
}

.close-icon {
    cursor: pointer;
}
.msg-target {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: 10px;
}
.msg-profile {
    width: 28px;
    height: 28px;
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
			&:hover{
				background-color: #019ed9;
			}
        }
    }
}

.sender-msg {
	* {
		text-align: right;
	}
}
</style>
