<template>
	<div class="alert-container">
		<div class="alert-box">
            <div class="alert-title">
                <h4 class="title">{{ t("알림창") }}</h4>
                <div class="division"></div>
            </div>
			<section v-if="meetingAlertStatus == 1">
                <div class="content">
                    <p class="msg alert-text">{{ t("메일 요청 확인 중입니다") }}</p>
                </div>
            </section>
			<section v-if="meetingAlertStatus == 2">
                <div class="content">
                    <p class="msg alert-text">{{ t("이미 초대된 사용자입니다") }}</p>
                </div>
                <div class="control-buttons">
                    <button @click="handleClickModalClose" class="decline-btn">
                        {{ t("닫기") }}
                    </button>
                </div>
            </section>
			<section v-if="meetingAlertStatus == 3">
                <div class="content">
                    <p class="msg alert-text">{{ t("메일 전송이 완료되었습니다") }}</p>
                </div>
				<div class="control-buttons">
                    <button @click="handleClickModalClose" class="decline-btn">
                        {{ t("닫기") }}
                    </button>
                </div>
            </section>
		</div>
	</div>
</template>

<script setup>
import { useMeetingStore } from "@/stores/meeting";
import { computed } from "vue";
import { useVfm } from "vue-final-modal";
const vfm = useVfm();
const { t } = useI18n();

const meetingStore = useMeetingStore();
const handleClickModalClose = () => {
	vfm.close("meeting-modal")
}

const meetingAlertStatus = computed(() => meetingStore.meetingAlertStatus)
</script>

<style lang="scss" scoped>
p {
    margin: 0 0 0 !important;
}

h4 {
	margin: 0;
}

.alert-container {
    position: relative;
    float: none !important;
    min-width: 430px;
    min-height: 326px;
    width: max-content;
    height: max-content;
    background-color: #262627;
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.45); /* #00000073 대신 rgba 사용 */
    padding: 58px 37px 38px 37px;
    border: 1px solid #4d4d4d;
    box-sizing: border-box;
}

.alert-box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    height: 100%;
    width: 100%;
    > section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        width: 100%;
		min-height: 200px;
    }
}

.alert-title {
    width: 100%;
    text-align: left;
}

.close-btn {
    position: absolute;
    top: 5px;
    right: 0px;

    > img {
        width: 14px;
    }
}

.title {
    color: white;
    font-weight: bolder;
    margin-bottom: 3px;
}

.division {
    width: 100%;
    height: 1px;
    border-top: 1px solid #323232;
}

.alert-text {
    color: #d6d6d6;
    line-height: 1.7;
}

.content {
    margin: auto;
	padding: 20px 0;
    &.msg {
        padding-top: 20px;
        font-size: 14px;
        color: yellow;
    }
}

.control-buttons {
    margin-top: auto;

    button + button {
        margin-left: 10px;
    }
    .accept-btn {
        color: white;
        padding: 6px 22px;
        font-size: 13px;
        border-radius: 15px;
        background-color: #1c8eff;
    }
    .decline-btn {
        color: white;
        padding: 6px 22px;
        font-size: 13px;
        border-radius: 15px;
        background-color: #575757;
    }
}

.file-box {
    display: flex;
    .file-label {
        color: #fff;
        font-size: 13px;
        border-radius: 6px;
        margin: 0px 12px 0px 12px;
        width: 100px;
        background-color: grey;
        line-height: 1.6;
        padding: 5px;
        cursor: pointer;
    }

    .file-input {
        width: 100%;
        height: 33px;
        padding: 0 8px;
        background-color: #343434;
        color: #fff;
    }
}
</style>
