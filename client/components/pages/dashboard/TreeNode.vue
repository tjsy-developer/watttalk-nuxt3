<template>
    <li class="tree-node">
        <div class="node-label" @click.stop="toggle">
			<img v-if="node.deviceType == 1 && node.status == 1" :src="commonImages.logOnMobile"></img>
			<img v-if="node.deviceType == 1 && node.status == 0" :src="commonImages.logOffMobile"></img>
			<img v-if="node.deviceType == 2 && node.status == 1" :src="commonImages.logOnGlass"></img>
			<img v-if="node.deviceType == 2 && node.status == 0" :src="commonImages.logOffGlass"></img>
			<img v-if="node.deviceType == 3 && node.status == 1" :src="commonImages.logOnDesktop"></img>
			<img v-if="node.deviceType == 3 && node.status == 0" :src="commonImages.logOffDesktop"></img>
			<div v-if="!hasChildren" class="status">
				<img :src="iconLogOffUser"></img>
				<div v-if="node.status == 1" class="user-status"></div>
			</div>
			<span>{{ node.name }}</span>
			<div v-if="!hasChildren" class="button-box">
				<img v-if="node.status == 1" :src="commonImages.useCall" @click="requestCall(node.deviceId!)"></img>
				<img v-if="node.status == 0" :src="commonImages.useNotCall" @click="requestCall(node.deviceId!)"
                    @mouseover="handleMouseCallOver"
                    @mouseleave="handleMouseCallLeave"></img>
				<img v-if="node.status == 1" :src="commonImages.useChat" @click="requestChat(node.deviceId!)"></img>
				<img v-if="node.status == 0" :src="commonImages.useNotChat" @click="requestChat(node.deviceId!)"
                    @mouseover="handleMouseChatOver"
                    @mouseleave="handleMouseChatLeave"></img>
			</div>
			<img v-if="hasChildren" :src="commonImages.dropdown" :class="isOpen ? 'dropdown active': 'dropdown'"/>
        </div>

        <ul v-if="isOpen && hasChildren" class="children">
            <TreeNode
                v-for="(child, index) in node.children"
                :key="index"
                :node="child"
                :openNodes="openNodes"
                :parentPath="currentPath"
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
}

const props = defineProps<{
    node: OrgNode;
    openNodes: Set<string>;
    parentPath: string[];
}>();
const commonStore = useCommonStore();
const modalStore = useModalStore();
const callStore = useCallStore();
const directMessageStore = useDirectMessageStore();
const meettingStore = useMeetingStore();

const {
  contentsViewType
} = storeToRefs(commonStore)

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

function requestCall(remoteDeviceId: string) {
    try {
        modalStore.openModal('device', {
            type: "request",
            deviceId: remoteDeviceId,
            requestCall: () => {
                commonStore.setDeviceModifyState(false)
                console.log("Call Request Success", contentsViewType.value )
                if (contentsViewType.value == 2) {
                    callStore.setInCallingFunctionParams(remoteDeviceId)
                    callStore.setInCallingFunction("userStatusRequest")
                } else {
                    requestUserStatus(remoteDeviceId)
                    modalStore.closeModal("notice")
                }
            }
        });
    } catch (error) {
        console.log(error)
    }

}

function requestChat(remoteDeviceId: string) {

}

</script>

<style lang="scss">
.tree-node {
    margin-left: 1rem;
	li {
		list-style: none;
	}

    > .children > .tree-node > .children > .tree-node > .node-label {
        > :nth-child(1) {
            flex: 0 0 24px;
        }
        > :nth-child(2) {
            flex: 0 0 70px; /* 고정 너비 150px */
        }
        > :nth-child(3) {
            flex: 0 0 200px;
        }
        > :nth-child(3) {
            flex: 0 0 200px;
        }
    }
}

.node-label {
    cursor: pointer;
    height: 5.0rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
	padding-right: 25px;
	@include tc(color, 'text-color');

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
</style>
