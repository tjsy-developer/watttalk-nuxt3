<template>
    <VueFinalModal :clickToClose="false" class="modal-container alert-modal">
        <div class="noneOverayModalContainer">
            <div class="">
                <div class="alertTitleCon">
                    <span class="alertTitle">{{ t("알림창") }}</span>
                </div>
                <div class="mobileScreenCaptureBox">
                    <p class="msg mobileScreenCaptureText">
                        {{ t("회의를 삭제하시겠습니까?") }}
                    </p>
                    <div
                        class="row items-center alertControlbuttons mobileScreenCaptureButtons"
                    >
                        <button
                            @click="deleteMeetingRoom(props.seq)"
                            class="hostRequestadelineButton"
                        >
                            {{ t("예") }}
                        </button>
                        <button @click="close" class="hostRequestadelineButton">
                            {{ t("아니오") }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </VueFinalModal>
</template>

<script setup>
import { defineProps } from "vue";
import { useMeetingStore } from "@/stores/meeting";
import { VueFinalModal } from "vue-final-modal";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps({
    seq: {
        type: Number,
        required: true,
    },
});

const emit = defineEmits(["close"]);
const meetingStore = useMeetingStore();

// SASS 파일은 Nuxt 3에서 자동으로 컴파일되므로 별도의 require는 필요 없습니다.
// setup() 스크립트에서 import만 해주면 됩니다.
// import "@/assets/styles/light/components/meeting/deleteMeeting.sass";
// 하지만, 위와 같이 sass 파일을 import하면 전역적으로 적용될 수 있습니다.
// scoped 스타일을 유지하려면 아래 <style> 블록을 활용하는 것이 더 좋습니다.

const close = () => {
    // 모달을 닫는 로직은 사용하는 모달 라이브러리에 따라 달라집니다.
    // 여기서는 예시로 useModalComposable과 같은 컴포저블을 가정합니다.
    // useModalComposable.hide("modal");
    // 또는 이벤트 방출 방식을 사용합니다.
    emit("close");
};

// 회의실을 삭제하는 함수
const deleteMeetingRoom = (meetingSeq) => {
    console.log("*** methods: deleteMeetingRoom::");
    console.log("*** methods: deleteMeetingRoom:: meetingSeq = ", meetingSeq);

    // Vuex Store 사용 방식 변경
    meetingStore.setMeetingSeq(meetingSeq);
    meetingStore.setMeetingDeleteFlag(true);

    close();
};
</script>

<style lang="scss" scoped>
p {
    margin-bottom: 51px;
    text-align: center;
}

.noneOverayModalContainer {
    float: none !important;
    width: 100%;
    height: 100%;
    padding: 50px 37px;
	box-sizing: border-box;
	background-color: #262627;
	color: #fff;

	>div {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	button {
		color: #fff;
	}
    @media all and (max-width: 767px) {
        padding: 20px 27px 50px 27px;
    }
}

.exclamationMarkImg {
    position: absolute;
    top: 2px;
    right: 29px;
    width: 131px;
}

.alertCloseBtn {
    position: absolute;
    top: 5px;
    right: 5px;
}

.alertCloseImg {
    width: 14px;
}

.alertTitle {
    font-size: 22px;
    font-weight: bolder;
    margin-left: 7px;
    margin-bottom: 3px;
}

.titleUnderLine {
    height: 1px;
    background: #3c3c3c;
    margin-top: 5px;
}

.msg {
    /* No specific styles defined in original .sass for .msg itself */
}

.alertMessageBox {
    text-align: center;
    height: 150px;
}

.requestStatus {
    padding-top: 30px;
    display: flex;
    justify-content: center;

    @media screen and (max-width: 479px) {
        padding: 10px;
    }

    > div {
        /* Original was commented out: */
        // &:first-child
        //   margin: auto
        // &:last-child
        //   width: auto
        //   margin: auto
    }
}

.alertText {
    font-size: 15px;
    line-height: 24px;
    word-break: keep-all !important;
}

.alertControlbuttons {
    margin: 0px 0px 3px 10px;
    width: inherit;
    display: flex;
    justify-content: center;
    height: 34px;
    // margin-left: 10px
    // margin: 0px auto;

    > button {
        padding: 6px 22px;
        margin-right: 10px;
        font-size: 13px;
        border-radius: 15px;

        &:first-child {
			background-color: #1c8eff;
        }

        &:last-child {
			background-color: #464646;
            /* No specific styles in original */
        }
    }
}
</style>
