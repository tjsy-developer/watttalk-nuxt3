<template>
    <div class="recent-list">
        <div v-for="user in props.data" :key="user.deviceid">
            <div>
                <img
                    v-if="user.devicetype == 1 && user.status == 1"
                    :src="commonImages.logOnMobile"
                />
                <img
                    v-if="user.devicetype == 1 && user.status == 0"
                    :src="commonImages.logOffMobile"
                />
                <img
                    v-if="user.devicetype == 2 && user.status == 1"
                    :src="commonImages.logOnGlass"
                />
                <img
                    v-if="user.devicetype == 2 && user.status == 0"
                    :src="commonImages.logOffGlass"
                />
                <img
                    v-if="user.devicetype == 3 && user.status == 1"
                    :src="commonImages.logOnDesktop"
                />
                <img
                    v-if="user.devicetype == 3 && user.status == 0"
                    :src="commonImages.logOffDesktop"
                />
                <div class="status">
                    <img :src="iconLogOffUser" />
                    <div v-if="user.status == 1" class="user-status"></div>
                </div>
                <div class="hq-box">
                    <span class="user-name">{{ user.nickname }}</span>
                    <span>
                        {{ user.headquarters }}
                    </span>
                    <span>
                        {{ user.branch }}
                    </span>
                </div>
                <span class="call-time">{{ contactDateFormat(user.end_time) }}</span>
            </div>

            <div class="button-box">
                <img
                    v-if="user.status == 1"
                    :src="commonImages.useCall"
                    @click="requestCall(user.deviceid)"
                />
                <img
                    v-if="user.status == 0"
                    :src="commonImages.useNotCall"
                    @click="requestCall(user.deviceid)"
                    @mouseover="handleMouseCallOver"
                    @mouseleave="handleMouseCallLeave"
                />
                <img
                    v-if="user.status == 1"
                    :src="commonImages.useChat"
                    @click="requestChat(user)"
                />
                <img
                    v-if="user.status == 0"
                    :src="commonImages.useNotChat"
                    @click="requestChat(user)"
                    @mouseover="handleMouseChatOver"
                    @mouseleave="handleMouseChatLeave"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import TreeNode from "@/components/pages/dashboard/TreeNode.vue";
import { useImageAssets } from "@/composables/useImageAssets";
import { useCommonStore } from "@/stores";
import { useModalStore } from "@/stores/modal";
import { useCallStore } from "@/stores/call";
import { useDirectMessageStore } from "@/stores/directMessage";
import { useMeetingStore } from "@/stores/meeting";
import { iconLogOffUser } from "@/assets/images/index";

import useSocketEmitEvents from "@/composables/socket/useSocketEmit";
import { storeToRefs } from "pinia";
import { useModal, useModalSlot, useVfm, VueFinalModal } from "vue-final-modal";
import ChatModal from "@/components/modal/ChatModal.vue";
import { useNuxtApp } from "nuxt/app";
const { $t } : any = useNuxtApp()
const { commonImages } = useImageAssets();
const { requestUserStatus } = useSocketEmitEvents();
interface OrgNode {
    deviceid: string;
    devicetype: number;
    status: number;
    connectingstatus: number;
    end_time: number;
    call_count: number;
    image: string;
    institution: string;
    nickname: string;
    headquarters: string;
    branch: string;
}

const commonStore = useCommonStore();
const modalStore = useModalStore();
const callStore = useCallStore();
const directMessageStore = useDirectMessageStore();
const meettingStore = useMeetingStore();

const vfm = useVfm();
const props = defineProps<{
    data: OrgNode[];
    search: string;
}>();
console.log("여기왜이렇게 늦니");

const { contentsViewType } = storeToRefs(commonStore);
const openNodes = ref(new Set<string>());

function handleMouseCallOver(event: MouseEvent) {
    const target = event.target as HTMLImageElement;
    target.src = commonImages.value.useCall;
}

function handleMouseCallLeave(event: MouseEvent) {
    const target = event.target as HTMLImageElement;
    target.src = commonImages.value.useNotCall;
}

function handleMouseChatOver(event: MouseEvent) {
    const target = event.target as HTMLImageElement;
    target.src = commonImages.value.useChat;
}

function handleMouseChatLeave(event: MouseEvent) {
    const target = event.target as HTMLImageElement;
    target.src = commonImages.value.useNotChat;
}

function requestCall(remoteDeviceId: string | undefined) {
    alert(remoteDeviceId)
    if (!remoteDeviceId) return;
    try {
        modalStore.openModal("device", {
            type: "request",
            deviceId: remoteDeviceId,
            requestCall: () => {
                commonStore.setDeviceModifyState(false);
                console.log("Call Request Success", contentsViewType.value);
                if (contentsViewType.value == 2) {
                    //@ts-ignore
                    callStore.setInCallingFunctionParams(remoteDeviceId);
                    //@ts-ignore
                    callStore.setInCallingFunction("userStatusRequest");
                } else {
                    requestUserStatus(remoteDeviceId);
                    modalStore.closeModal("notice");
                }
            },
        });
    } catch (error) {
        console.log(error);
    }
}

function requestChat(remoteUser: OrgNode) {
    // chattingList 에 추가하고
    const { open } = useModal({
        component: VueFinalModal,
        keepAlive: true,
        attrs: {
            modalId: "chat-modal-" + remoteUser.deviceid,
            displayDirective: "show",
            background: "interactive",
            contentTransition: "vfm-fade",
            hideOverlay: true,
            "onUpdate:modelValue": (val: any) => {
                console.log("chat modal open state changed:", val);
            },
            class: "modal-container chat-modal non-overlay",
            
        },
        slots: {
            default: useModalSlot({
                component: ChatModal,
                attrs: {
                    remoteDeviceId: remoteUser.deviceid,
                    remoteNickName: remoteUser.nickname,
                    profile: remoteUser.image,
                }
            }),
        },
    });
    open();
    // directMessageStore.setRemoteMessageList({ remoteDeviceId: remoteUser.deviceid})
}

function contactDateFormat(datetime: number) {
    const timestampMs = datetime < 1e12 ? datetime * 1000 : datetime;
    const dateObj = new Date(timestampMs);

    // 개별 키로 요일과 월/일 글자 가져오기
    const monthLabel = $t("week7");
    const dayLabel = $t("week8");
    const todayLabel = `(${$t(`week${dateObj.getDay()}`)})`;

    const month = dateObj.getMonth() + 1 + monthLabel;
    const day = dateObj.getDate() + dayLabel;

    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");

    return `${month} ${day} ${todayLabel} ${hours}:${minutes}`;
}
</script>

<style scoped>
.org-tree {
    list-style: none;
    padding: 0;
    margin: 0;
}

.recent-list > div {
    display: flex;
    justify-content: space-between;
    padding: 0 12px;
}
.recent-list > div > div:not(.button-box) {
    display: flex;
    color: #fff;
    align-items: center;
    height: 53px;
    gap: 20px;
    padding: 12px 0;
}

.hq-box {
    font-size: 1.4rem;
    display: flex;
    flex-direction: column;
    min-width: 130px;
}

.call-time,
.user-name {
    color: #d3d3d3;
    font-size: 1.4rem;
}
.status img {
    width: 45px;
}

.user-name {
    font-weight: 800;
}
.button-box {
    display: flex;
    gap: 8px;
    align-items: center;
    > img {
        height: 33px;
        width: 38px;
        cursor: pointer;
    }
}
.status {
    position: relative;
}
.user-status {
    position: absolute;
    width: 15px;
    height: 15px;
    border-radius: 15px;
    border: 1px solid #000;
    background-color: rgb(0, 171, 37);
    left: 32px;
    top: 30px;
}
</style>
