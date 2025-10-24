<template>
    <li :class="`tree-node`">
        <div class="node-label" @click.stop="toggle">
            <input
                type="checkbox"
                v-if="props.useCheckBox"
                class="checkbox"
                :checked="node.checked"
                @click="handleClickCheck(node)"
            />
            <label
                for="checkbox"
                class="checkbox-label"
                v-if="props.useCheckBox"
                @click.stop="handleClickCheck(node)"
            ></label>
            <img
                v-if="node.deviceType == 1 && node.status == 1 && !props.useCheckBox"
                :src="commonImages.logOnMobile"
            />
            <img
                v-if="node.deviceType == 1 && node.status == 0 && !props.useCheckBox"
                :src="commonImages.logOffMobile"
            />
            <img
                v-if="node.deviceType == 2 && node.status == 1 && !props.useCheckBox"
                :src="commonImages.logOnGlass"
            />
            <img
                v-if="node.deviceType == 2 && node.status == 0 && !props.useCheckBox"
                :src="commonImages.logOffGlass"
            />
            <img
                v-if="node.deviceType == 3 && node.status == 1 && !props.useCheckBox"
                :src="commonImages.logOnDesktop"
            />
            <img
                v-if="node.deviceType == 3 && node.status == 0 && !props.useCheckBox"
                :src="commonImages.logOffDesktop"
            />
            <div v-if="!hasChildren && !props.useCheckBox" class="status">
                <img :src="iconLogOffUser" />
                <div v-if="node.status == 1" class="user-status"></div>
            </div>
            <span>{{ locale == "ko" ? node.name : node.enName || node.name }}</span>
            <div v-if="!hasChildren" class="button-box">
                <img
                    v-show="node.status == 1 && !props.useCheckBox"
                    :class="{ 'hidden-but-space': inRoom }"
                    :src="commonImages.useCall"
                    @click="requestCall(node.deviceId)"
                />
                <img
                    v-show="node.status == 0 && !props.useCheckBox"
                    :src="commonImages.useNotCall"
                    @click="requestCall(node.deviceId)"
                    @mouseover="handleMouseCallOver"
                    @mouseleave="handleMouseCallLeave"
                />
                <img
                    v-show="node.status == 1 && !props.useCheckBox"
                    :src="commonImages.useChat"
                    @click="requestChat(node)"
                />
                <img
                    v-show="node.status == 0 && !props.useCheckBox"
                    :src="commonImages.useNotChat"
                    @click="requestChat(node)"
                    @mouseover="handleMouseChatOver"
                    @mouseleave="handleMouseChatLeave"
                />
            </div>
            <img
                v-if="hasChildren"
                :src="commonImages.dropdown"
                :class="isOpen ? 'dropdown active' : 'dropdown'"
            />
        </div>

        <ul v-if="isOpen && hasChildren" class="children">
            <TreeNode
                v-for="child in node.children"
                :key="`${child.name}_${child.deviceId}`"
                :node="child"
                :openNodes="openNodes"
                :parentPath="currentPath"
                :useCheckBox="props.useCheckBox"
            />
        </ul>
    </li>
</template>

<script setup>
import { common } from "@/assets/images";
import { iconLogOffUser, iconLogOnUser } from "@/assets/images/index";
import ChatModal from "@/components/modal/ChatModal.vue";
import useSocketEmitEvents from "@/composables/socket/useSocketEmit";
import { useImageAssets } from "@/composables/useImageAssets";
import { useRoomStore } from "@/stores/room";
import { useCallStore } from "@/stores/call";
import { useDirectCallStore } from "@/stores/directCall";
import { useDirectMessageStore } from "@/stores/directMessage";
import { useMeetingStore } from "@/stores/meeting";
import { useModalStore } from "@/stores/modal";
import { useColorMode } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { computed, defineProps, onMounted, reactive, ref, watch } from "vue";
import { useModal, useModalSlot, useVfm, VueFinalModal } from "vue-final-modal";

const vfm = useVfm();
const { t, locale } = useI18n();
const { commonImages } = useImageAssets();
const { requestUserStatus } = useSocketEmitEvents();

const props = defineProps(["node", "openNodes", "parentPath", "useCheckBox"]);
const commonStore = useRoomStore();
const modalStore = useModalStore();
const callStore = useCallStore();
const directMessageStore = useDirectMessageStore();
const meettingStore = useMeetingStore();

const { contentsViewType } = storeToRefs(commonStore);

const hasChildren = computed(() => !!props.node.children?.length);
const currentPath = [...props.parentPath, props.node.name];

const isOpen = computed(() => props.openNodes.has(getNodeKey(currentPath)));
const feeds = toRef(callStore, 'feeds') // ✅ ref 형태로 다시 감싸줌

const inRoom = computed(() => {
    const result = feeds.value.some(feed => {
        console.log("feed.rfdeviceid:", feed.rfdeviceid, "node.deviceId:", props.node.deviceId)
        return feed.rfdeviceid === props.node.deviceId
    })
    console.log('📡 inRoom 계산됨:', result)
    return result
})

function getNodeKey(path) {
    return path.join(">");
}

function toggle(e) {
    function isCheckboxInput(target) {
        return (
            target !== null &&
            target instanceof HTMLInputElement &&
            target.type === "checkbox"
        );
    }

    if (isCheckboxInput(e.target)) {
        console.log("Checkbox checked:", e.target.checked);
        return;
    }

    if (!hasChildren.value) return;
    const key = getNodeKey(currentPath);

    if (props.openNodes.has(key)) {
        props.openNodes.delete(key);
    } else {
        props.openNodes.add(key);
    }
}

function handleMouseCallOver(event) {
    const target = event.target;
    target.src = commonImages.value.useCall;
}

function handleMouseCallLeave(event) {
    const target = event.target;
    target.src = commonImages.value.useNotCall;
}

function handleMouseChatOver(event) {
    const target = event.target;
    target.src = commonImages.value.useChat;
}

function handleMouseChatLeave(event) {
    const target = event.target;
    target.src = commonImages.value.useNotChat;
}

function requestCall(remoteDeviceId) {
    if (!remoteDeviceId) return;

    function calling() {
        if (contentsViewType.value == 2) {
            //@ts-ignore
            callStore.setInCallingFunctionParams(remoteDeviceId);
            //@ts-ignore
            callStore.setInCallingFunction("userStatusRequest");
        } else {
            requestUserStatus(remoteDeviceId);
            modalStore.closeModal("notice");
        }
    }

    if (contentsViewType.value == 0) {
        modalStore.openModal("device", {
            type: "request",
            deviceId: remoteDeviceId,
            requestCall: () => {
                commonStore.setDeviceModifyState(false);
                console.log("Call Request Success", contentsViewType.value);
                calling();
            },
        });
    } else {
        calling();
    }
}

function requestChat(remoteUser) {
    const modalId = "chat-modal-" + remoteUser.deviceId;
    if (vfm.get(modalId)) {
        vfm.open(modalId);
        return;
    }

    // 최초 등록
    const { open } = useModal({
        component: VueFinalModal,
        keepAlive: true,
        attrs: {
            modalId,
            displayDirective: "show",
            background: "interactive",
            contentTransition: "vfm-fade",
            hideOverlay: true,
            class: "modal-container chat-modal non-overlay",
            "onUpdate:modelValue": (val) => {
                console.log("chat modal open state changed:", val);
            },
        },
        slots: {
            default: useModalSlot({
                component: ChatModal,
                attrs: {
                    remoteDeviceId: remoteUser.deviceId,
                    remoteNickName: remoteUser.name,
                    profile: remoteUser?.image,
                },
            }),
        },
    });
    open();
}

function handleClickCheck(node) {
    console.log(node)
    const newCheckedState = !node.checked;
    setCheckedStateRecursive(node, newCheckedState);
    updateParentCheckStatus(node);
}

function setCheckedStateRecursive(node, checked) {
    node.checked = checked;
    if (node.children && node.children.length > 0) {
        node.children.forEach((child) => setCheckedStateRecursive(child, checked));
    }
}

function updateParentCheckStatus(node) {
    const parent = node.parent;
    if (!parent) return;

    parent.checked = parent.children.every((child) => child.checked);

    updateParentCheckStatus(parent);
}

onMounted(() => {});
</script>

<style lang="scss">
.tree-node {
    padding-left: 2rem;
    li {
        list-style: none;
    }

    > .children > .tree-node > .children > .tree-node > .node-label {
        > img {
            /* flex: 0 0 24px; */
        }
        > .status {
            flex: 0 0 70px; /* 고정 너비 150px */
        }
        > span {
            flex: 0 0 168px;
        }
        > .button-box {
            flex: 0 0 145px;
            margin-left: auto;
            > img.hidden-but-space {
                visibility: hidden;
            }
        }
    }
}

.node-label {
    cursor: pointer;
    height: 6rem;
    display: flex;
    align-items: center;
    /* justify-content: space-between; */
    padding-right: 25px;
    .checkbox-label {
        margin-right: 10px;
    }
    .status {
        text-align: center;
        position: relative;
    }
    .status img {
        width: 45px;
    }

    .button-box {
        img + img {
            margin-left: 10px;
        }
    }
}

.children {
    margin-top: 4px;
    margin-left: 1rem;
    padding-left: 0.5rem;
}

.arrow {
    margin-left: 8px;
    font-size: 12px;
}
.user-status {
    position: absolute;
    width: 15px;
    height: 15px;
    border-radius: 15px;
    border: 1px solid #000;
    background-color: rgb(0, 171, 37);
    top: left;
    left: 44px;
    top: 30px;
}

.dropdown {
    margin-left: auto;
}
</style>
