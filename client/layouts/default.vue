<template>
    <ModalsContainer />
    <!-- 모달 -->
    <VueFinalModal
        v-model="isLoginModalVisible"
        :clickToClose="false"
        class="modal-container"
    >
        <MainModal></MainModal>
    </VueFinalModal>
    <VueFinalModal
        v-model="isDeviceModalVisible.visible"
        :clickToClose="false"
        class="modal-container"
    >
        <DeviceSelectModal v-bind="isDeviceModalVisible.props"></DeviceSelectModal>
    </VueFinalModal>
    <VueFinalModal
        v-model="isMessageModalVisible"
        :clickToClose="false"
        class="modal-container"
    >
        <MessageModal></MessageModal>
    </VueFinalModal>
    <VueFinalModal
        v-model="isHostMessageModalVisible"
        :clickToClose="false"
        class="modal-container"
    >
        <HostMessageModal></HostMessageModal>
    </VueFinalModal>
    <VueFinalModal
        v-model="isFileSendModalVisible"
        :clickToClose="false"
        class="modal-container"
    >
        <FileSendModal></FileSendModal>
    </VueFinalModal>
    <VueFinalModal
        v-model="isAlertModal"
        :clickToClose="false"
        class="modal-container"
    >
        <AlertModal></AlertModal>
    </VueFinalModal>
    <VueFinalModal
        modal-id="notice-modal"
        display-directive="show"
        background="interactive"
        content-transition="vfm-fade"
        :hide-overlay="true"
        @update:model-value="val => emit('update:modelValue', val)"
        class="modal-container notice-modal non-overlay"
    >
        <NoticeModal></NoticeModal>
    </VueFinalModal>
    <div class="content">
        <slot></slot>
    </div>
    <div id="toast">
        <img src="@/assets/images/calling/ic_alarm.png" style="margin-right: 10px" />
        <span></span>
    </div>
    <div id="toast_signalling">
        <img src="@/assets/images/calling/ic_alarm.png" style="margin-right: 10px" />
        <span></span>
    </div>
    <div id="toast_common_message">
        <img src="@/assets/images/calling/ic_alarm.png" style="margin-right: 10px" />
        <span></span>
    </div>
</template>

<script setup>
const emit = defineEmits(["update:modelValue"]);
import { onMounted } from "vue";
import { ModalsContainer, VueFinalModal } from "vue-final-modal";

import dHeader from "@/components/layout/header.vue";
import sidebar from "@/components/layout/sidebar.vue";
import MainModal from "@/components/modal/MainModal.vue";
import DeviceSelectModal from "@/components/modal/DeviceSelectModal.vue";
import MessageModal from "@/components/modal/MessageModal.vue";
import HostMessageModal from "@/components/modal/HostMessageModal.vue";
import FileSendModal from "@/components/modal/FileSendModal.vue";
import AlertModal from "@/components/modal/AlertModal.vue";

import ChatModal from "@/components/modal/ChatModal.vue";
import NoticeModal from "@/components/modal/NoticeModal.vue";
import { useCallStore } from "@/stores/call";
const modalStore = useModalStore();
const commonStore = useRoomStore();
const callStore = useCallStore();

function onUpdateModelValue(val) {
    emit("update:modelValue", val);
}

// 각 모달의 가시성 상태는 activeModals 배열에 해당 타입이 포함되어 있는지로 확인
const isLoginModalVisible = computed({
    get: () => modalStore.isModalOpen("call"),
    set: (val) => {
        if (!val) modalStore.closeModal("call", false); // ESC 키나 외부 클릭으로 닫힐 때
    },
});

const isDeviceModalVisible = computed({
    get: () => ({
        visible: modalStore.isModalOpen("device"),
        props: modalStore.getModalData("device"),
    }),
    set: (val) => {
        if (!val.visible) {
            modalStore.closeModal("device", false);
        }
    },
});

console.log(isDeviceModalVisible);

const isMessageModalVisible = computed({
    get: () => modalStore.isModalOpen("message"),
    set: (val) => {
        if (!val) modalStore.closeModal("message", false);
    },
});

const isHostMessageModalVisible = computed({
    get: () => modalStore.isModalOpen("host"),
    set: (val) => {
        if (!val) modalStore.closeModal("host", false);
    },
});

const isFileSendModalVisible = computed({
    get: () => modalStore.isModalOpen("fileSend"),
    set: (val) => {
        if (!val) modalStore.closeModal("fileSend", false);
    },
});

const isAlertModal = computed({
    get: () => modalStore.isModalOpen("noneOverlayModal"),
    set: (val) => {
        if (!val) modalStore.closeModal("noneOverlayModal", false); // ESC 키나 외부 클릭으로 닫힐 때
    },
});

onMounted(() => {
});
</script>

<style lang="scss" scoped>
.content {
    position: absolute;
    width: -webkit-fill-available;
    height: -webkit-fill-available;
    max-width: 100vw;
    max-height: 100vh;
    @include tc(background-color, "bg-color");
}

%toast-base {
    width: fit-content;
    position: fixed;
    top: 25%;
    left: 50%;
    padding: 12px 30px;
    transform: translate(-50%, 10px);
    border-radius: 30px;
    overflow: hidden;
    font-size: 19px;
    opacity: 0;
    visibility: hidden;
    transition:
        opacity 0.1s,
        visibility 0.5s,
        transform 0.5s;
    z-index: 10000;
    display: flex;
    align-items: center;
    color: #fff;
    background-color: #595959;
}

%toast-reveal {
    opacity: 1;
    visibility: visible;
    transform: translate(-50%, 0);
}

#toast {
    @extend %toast-base;

    &.reveal {
        @extend %toast-reveal;
    }
}

#toast_signalling {
    @extend %toast-base;

    &.reveal {
        @extend %toast-reveal;
    }
}

#toast_common_message {
    @extend %toast-base;

    &.reveal {
        @extend %toast-reveal;
    }
}
</style>
