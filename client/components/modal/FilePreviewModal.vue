<template>
    <VueFinalModal v-bind="$attrs">
        <div class="noneOverayModalContainer">
            <div>
                <div class="modal-title">
                    <span class="alertTitle">{{ $t("file preview") }}</span>
                    <div class="previewCloseBtn">
                        <img
                            @click="previewfullScreen"
                            src="@/assets/images/calling/bt_maximization.png"
                            :title="$t('maximize')"
                            class="fullscreenImg"
                        />
                        <img
                            @click="previewClose"
                            src="@/assets/images/calling/ic_close.png"
                            class="previewCloseImg"
                        />
                    </div>
                </div>
                <div class="alertMessageBox justify-center">
                    <img
                        class="previewImg"
                        :src="previewImage"
                        @click="openDrawingConfirm"
                        :title="
                            videoCallHost && !drawingIframe
                                ? $t('go to drawing')
                                : undefined
                        "
                        :style="{
                            cursor:
                                videoCallHost && !drawingIframe ? 'pointer' : 'default',
                        }"
                    />
                </div>
            </div>
            <div v-show="isMaximize" id="maximize" class="size">
				<div class="modal-title maximize">
                    <span class="alertTitle">{{ $t("file preview") }}</span>
                    <button class="col-auto minimizationBtn" @click="minimizeBtnClick">
                        <img
                            src="@/assets/images/calling/bt_minimization.png"
                            :title="$t('minimization')"
                        />
                    </button>
                    <button class="col-auto minimizationCloseBtn" @click="cancelBtnClick">
                        <img src="@/assets/images/calling/ic_close.png" />
                    </button>
                </div>
                <img
                    :src="previewImage"
                />
            </div>
        </div>
    </VueFinalModal>
</template>

<script setup>
import { useCommonStore } from "@/stores";
import { useCallStore } from "@/stores/call";
import { useChattingStore } from "@/stores/chatting";
import { computed, onMounted, ref } from "vue";
import { VueFinalModal } from "vue-final-modal";

const commonStore = useCommonStore();
const callStore = useCallStore();
const chattingStore = useChattingStore();

const props = defineProps(['previewImage']);

const emit = defineEmits(['close']);
const show = ref(true);
console.log(props);

const isMaximize = ref(false);

const videoCallHost = computed(() => chattingStore.videoCallHost);
const drawingIframe = computed(() => callStore.drawingIframe);

const previewfullScreen = () => {
    isMaximize.value = true;
    const maximize = document.getElementById("maximize");
    maximize.style.width = "100%";
    maximize.style.height = "100%";
    maximize.style.zIndex = 3;
};

const previewClose = () => {
    commonStore.setPreviewModalFlag({
        modalIndex: props.openModalIndex,
        url: "",
        show: "hide",
	});
	emit('close')
};

const minimizeBtnClick = () => {
    isMaximize.value = false;
};

const cancelBtnClick = () => {
    isMaximize.value = false;
    commonStore.setPreviewModalFlag({
        modalIndex: props.openModalIndex,
        url: "",
        show: "hide",
    });
};

const openDrawingConfirm = () => {
    if (!videoCallHost.value || drawingIframe.value) return;

    commonStore.setNoneOverlayAlertStatus(11);
};
</script>

<style lang="scss" scoped>
p {
    margin: 0 !important;
}

.on {
    width: 100% !important;
    height: 100% !important;
    transition: all 2s;
}

.modal-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.2rem;
    background-color: #262626;
    padding: 0 4px;

	&.maximize {
		padding: 6px 4px;	
	}
    img {
        flex-shrink: 0;
    }

    .previewCloseImg {
        height: 13px;
    }
}
.previewCloseBtn {
    display: flex;
    align-items: center;
}
.noneOverayModalContainer {
    float: none !important;
    width: 415px;
    height: 265px;
    box-shadow: 0px 0px 15px #00000073;
    position: absolute;
    bottom: 8px;
    left: 8px;
    z-index: 2;
    color: #fff;
}

.exclamationMarkImg {
    position: absolute;
    top: 2px;
    right: 29px;
    width: 131px;
}

.previewImg {
    width: 100%;
    height: 100%;
    object-fit: contain;
    max-height: 243px;
    cursor: pointer;
}

.previewCloseBtn {
    cursor: pointer;
}

.fullscreenImg {
    cursor: pointer;
}

.requestStatus {
    width: 100%;
    height: calc(100% - 23px);
    overflow: hidden;

    > div:first-child {
        margin: auto;
    }

    > div:last-child {
        width: auto;
        margin: auto;
    }
}

.alertMessageBox {
    height: 100%;
    background-color: #000;
}

#maximize {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100vw;
    height: 100vh;
	background-color: #000;

    > img {
        object-fit: contain;
        width: 100%;
        height: calc(100vh - 22px);
    }

    > div {
        position: absolute;
        width: 100%;

        > span {
            font-size: 16px;
            padding-right: 15px;
        }

        .minimizationBtn {
            position: absolute;
            right: 27px;
            top: 7px;

            > img {
                width: 25px;
            }
        }

        .minimizationCloseBtn {
            position: absolute;
            right: 7px;
            top: 7px;
            margin-right: 2px;

            > img {
                width: 14px;
            }
        }
    }
}
</style>
