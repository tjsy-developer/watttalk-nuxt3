<template>
    <li :class="`tree-node`">
        <div class="node-label" @click.stop="toggle">
            <input type="checkbox" class="checkbox" :checked="node.checked" />
            <label
                for="checkbox"
                class="checkbox-label"
                v-if="props.useCheckBox"
                @click.stop="handleClickCheck(node)"
            ></label>
            <img
                v-if="node.deviceType == 1 && node.status == 1"
                :src="commonImages.logOnMobile"
            />
            <img
                v-if="node.deviceType == 1 && node.status == 0"
                :src="commonImages.logOffMobile"
            />
            <img
                v-if="node.deviceType == 2 && node.status == 1"
                :src="commonImages.logOnGlass"
            />
            <img
                v-if="node.deviceType == 2 && node.status == 0"
                :src="commonImages.logOffGlass"
            />
            <img
                v-if="node.deviceType == 3 && node.status == 1"
                :src="commonImages.logOnDesktop"
            />
            <img
                v-if="node.deviceType == 3 && node.status == 0"
                :src="commonImages.logOffDesktop"
            />
            <div v-if="!hasChildren" class="status">
                <img :src="iconLogOffUser" />
                <div v-if="node.status == 1" class="user-status"></div>
            </div>
            <span>{{ node.name }}</span>
            <div v-if="!hasChildren" class="button-box">
                <img
                    v-if="node.status == 1"
                    :src="commonImages.useCall"
                    @click="requestCall(node.deviceId)"
                />
                <img
                    v-if="node.status == 0"
                    :src="commonImages.useNotCall"
                    @click="requestCall(node.deviceId)"
                    @mouseover="handleMouseCallOver"
                    @mouseleave="handleMouseCallLeave"
                />
                <img
                    v-if="node.status == 1"
                    :src="commonImages.useChat"
                    @click="requestChat(node.deviceId)"
                />
                <img
                    v-if="node.status == 0"
                    :src="commonImages.useNotChat"
                    @click="requestChat(node.deviceId)"
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
                v-for="(child, index) in node.children"
                :key="index"
                :node="child"
                :openNodes="openNodes"
                :parentPath="currentPath"
                :useCheckBox="props.useCheckBox"
            />
        </ul>
    </li>
</template>

<script setup lang="ts">
import { common } from "@/assets/images";
import { iconLogOffUser, iconLogOnUser } from "@/assets/images/index";
import useSocketEmitEvents from "@/composables/socket/useSocketEmit";
import { useImageAssets } from "@/composables/useImageAssets";
import { useCommonStore } from "@/stores";
import { useCallStore } from "@/stores/call";
import { useDirectCallStore } from "@/stores/directCall";
import { useDirectMessageStore } from "@/stores/directMessage";
import { useMeetingStore } from "@/stores/meeting";
import { useModalStore } from "@/stores/modal";
import { useColorMode } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { computed, defineProps, onMounted, reactive, ref, watch } from "vue";

const { commonImages } = useImageAssets();
const { requestUserStatus } = useSocketEmitEvents();

interface OrgNode {
    name: string;
    status?: number;
    deviceType?: number;
    deviceId?: string;
    children?: OrgNode[];
    checked?: boolean;
}

const props = defineProps<{
    node: OrgNode;
    openNodes: Set<string>;
    parentPath: string[];
    useCheckBox?: boolean;
}>();
const commonStore = useCommonStore();
const modalStore = useModalStore();
const callStore = useCallStore();
const directMessageStore = useDirectMessageStore();
const meettingStore = useMeetingStore();

const { contentsViewType } = storeToRefs(commonStore);

const hasChildren = computed(() => !!props.node.children?.length);
const currentPath = [...props.parentPath, props.node.name];

const isOpen = computed(() => props.openNodes.has(getNodeKey(currentPath)));

function getNodeKey(path: string[]) {
    return path.join(">");
}
function toggle() {
    if (!hasChildren.value) return;
    const key = getNodeKey(currentPath);

    if (props.openNodes.has(key)) {
        props.openNodes.delete(key);
    } else {
        props.openNodes.add(key);
    }
}

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

function requestChat(remoteDeviceId: string | undefined) {}

function handleClickCheck (rootNode: any) {
    checkAllChildren(rootNode); // 1. 모든 하위 checked = true

    const deviceIds = collectLeafInfo(rootNode); // 2. 최하위 deviceid 수집

    console.log(deviceIds); // ['dev-002']
}

function checkAllChildren(node: any) {
    if (node.checked) {
        node.checked = false;
    } else {
        node.checked = true;
    }
    if (node.children && node.children.length > 0) {
        for (const child of node.children) {
            checkAllChildren(child);
        }
    }
}

function collectLeafInfo(node: any): { name: string, deviceid: string }[] {
    if (!node.children || node.children.length === 0) {
    return [{ name: node.name, deviceid: node.deviceId }];
  }

  let result: { name: string, deviceid: string }[] = [];
  for (const child of node.children) {
    result = result.concat(collectLeafInfo(child));
  }
  return result;
}
onMounted(() => {});
</script>

<style lang="scss">
.tree-node {
    margin-left: 1rem;
    li {
        list-style: none;
    }

    > .children > .tree-node > .children > .tree-node > .node-label {
        > img {
            flex: 0 0 24px;
        }
        > .status {
            flex: 0 0 70px; /* 고정 너비 150px */
        }
        > span {
            flex: 0 0 200px;
        }
        > .button-box {
            flex: 0 0 200px;
            margin-left: auto;
        }
    }
}

.node-label {
    cursor: pointer;
    height: 5rem;
    display: flex;
    align-items: center;
    /* justify-content: space-between; */
    padding-right: 25px;
    @include tc(color, "text-color");

    .checkbox {
        display: none;
    }
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
