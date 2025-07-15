<template>
    <ModalsContainer>
    </ModalsContainer>
    <!-- 모달 -->
	<VueFinalModal
		v-model="isLoginModalVisible"
		:clickToClose="false"
        class="modal-container main-modal"
	>
		<MainModal></MainModal>
	</VueFinalModal>
	<VueFinalModal
		v-model="isDeviceModalVisible"
		:clickToClose="false"
        class="modal-container device-modal"
	>
		<DeviceSelectModal></DeviceSelectModal>
	</VueFinalModal>
    <VueFinalModal
		v-model="isMessageModalVisible"
		:clickToClose="false"
        class="modal-container message-modal"
	>
		<MessageModal></MessageModal>
	</VueFinalModal>
    <VueFinalModal
		v-model="isHostMessageModalVisible"
		:clickToClose="false"
        class="modal-container message-modal"
	>
		<HostMessageModal></HostMessageModal>
	</VueFinalModal>
    <VueFinalModal
		v-model="isFileSendModalVisible"
		:clickToClose="false"
        class="modal-container file-modal"
	>
		<FileSendModal></FileSendModal>
	</VueFinalModal>
    <!--  -->
    <dHeader></dHeader>
    <div class="content">
        <slot></slot>
    </div>
    <sidebar></sidebar>
</template>

<script setup>
import { watch } from "vue";
import { ModalsContainer, VueFinalModal } from "vue-final-modal";
import dHeader from "@/components/layout/header.vue";
import sidebar from "@/components/layout/sidebar.vue";
import MainModal from "@/components/modal/MainModal.vue";
import DeviceSelectModal from "@/components/modal/DeviceSelectModal.vue";
import MessageModal from "@/components/modal/MessageModal.vue";
import { onMounted } from "vue";
import HostMessageModal from "@/components/modal/hostMessageModal.vue";
import FileSendModal from "@/components/modal/FileSendModal.vue";

const modalStore = useModalStore();
const commonStore = useCommonStore();

// 각 모달의 가시성 상태는 activeModals 배열에 해당 타입이 포함되어 있는지로 확인
const isLoginModalVisible = computed({
    get: () => modalStore.isModalOpen("login"),
    set: (val) => {
        if (!val) modalStore.closeModal("login", false); // ESC 키나 외부 클릭으로 닫힐 때
    },
});

const isDeviceModalVisible = computed({
    get: () => modalStore.isModalOpen("device"),
    set: (val) => {
        if (!val) modalStore.closeModal("device", false);
    },
});

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


onMounted(() => {
    commonStore.setAlertStatus(0)
    modalStore.isModalOpen("message")
})
</script>

<style lang="scss" scoped>
.content {
    position: absolute;
    left: 64px;
    top: 50px;
    width: 100%;
    height: 100vh;
    @include tc(background-color, "bg-color");
}
</style>
