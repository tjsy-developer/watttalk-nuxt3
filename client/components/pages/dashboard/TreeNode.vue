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
				<div class="user-status"></div>
			</div>
			<span>{{ node.name }}</span>
			<div v-if="!hasChildren">
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
import { computed, defineProps, onMounted, ref } from "vue";
import { useVfm } from "vue-final-modal";
import noneOverlayModal from "@/components/modal/mainModal.vue"
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

const hasChildren = computed(() => !!props.node.children?.length);

const currentPath = [...props.parentPath, props.node.name];
const parentPath = [...props.parentPath];

function getNodeKey(path: string[]) {
    return path.join(">");
}

const isOpen = computed(() => props.openNodes.has(getNodeKey(currentPath)));

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
    requestUserStatus(remoteDeviceId)
}

function requestChat(remoteDeviceId: string) {
    const vfm = useVfm()

    // 모달 열기
    vfm.open({
        component: noneOverlayModal,  // 보여줄 컴포넌트
        attrs: {
            name: "noneOverlayModal",
            width: innerWidth <= 350 ? 320 : 350,
            height: 270,
            clickToClose: false,
            overlay: false, // 오버레이 없애기
        },
        on: {
            // 'before-close': () => {
            //  modalsContainerStyle.display = "none";
            // }
        }
    });
}

</script>

<style lang="scss">
.tree-node {
    margin-left: 1rem;
	li {
		list-style: none;
	}
}

.node-label {
    cursor: pointer;
    height: 5.0rem;
    display: flex;
    /* justify-content: space-between; */
    align-items: center;
	padding-right: 25px;
	@include tc(color, 'text-color');

	.status {
		position: relative;
	}
	.status img {
		width: 45px;
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
    left: 30px;
    top: 30px;
}
</style>
