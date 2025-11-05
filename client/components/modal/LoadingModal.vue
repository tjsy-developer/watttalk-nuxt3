<template>
    <VueFinalModal :v-model="true" :clickToClose="false" class="modal-container">
        <div class="loading-container">
            <div id="loader"></div>
            <div v-if="props.maskLoadingType == 'prepairVideoCall'">
                <p>{{ t("prepareVideoCall1") }}</p>
                <p>{{ t("prepareVideoCall2") }}</p>
            </div>
            <div v-else-if="props.maskLoadingType == 'ThumnailTransfer'">
                <p>{{ t("prepareThumbnailTransfer1") }}</p>
                <p>{{ t("prepareThumbnailTransfer2") }}</p>
            </div>
            <div v-else-if="props.maskLoadingType == 'noneMemberSignup'">
                <p>{{ t("비회원 가입을 진행하고 있습니다") }}</p>
                <p>{{ t("잠시만 기다려주세요") }}</p>
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
    > div {
        width: max-content;
    }
    p {
		margin: 7px;
        font-size: 2rem;
        color: #fff;
        text-align: center;
    }
}
.loading-bar {
    height: 100px;
}
#loader {
	border: 16px solid #f3f3f3; /* 회색 배경 링 */
  	border-top: 16px solid #3498db; /* 파란색만 돌게 */
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
	margin-bottom: 15px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
