<template>
    <VueFinalModal
        :v-model="true"
        :clickToClose="false"
        class="modal-container"
    >
		<div class="loading-container">
			<img src="@/assets/images/gif/loading.gif" class="loading-bar">
			<div v-if="props.maskLoadingType == 'prepairVideoCall'">
				<p>{{ t("prepareVideoCall1") }}</p>
				<p>{{ t("prepareVideoCall2") }}</p>
			</div>
			<div v-else-if="props.maskLoadingType == 'ThumnailTransfer'">
				<p>{{ t("prepareThumbnailTransfer1") }}</p>
				<p>{{ t("prepareThumbnailTransfer2") }}</p>
			</div>
		</div>

    </VueFinalModal>
</template>

<script setup>
import { useNuxtApp } from "nuxt/app";
import { onMounted } from "vue";
import { VueFinalModal } from "vue-final-modal";
const { t } = useI18n();
const props = defineProps(["maskLoadingType"]);

onMounted(() => {
    console.log(props);
});
</script>

<style lang="scss">

.loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -82%);
	>div {
		width: max-content;
	}
	p {
		font-size: 2.0rem;
		color: #fff;
		text-align: center;
	}
}
.loading-bar {
	height: 100px;
}
</style>
