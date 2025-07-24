<template>
    <div class="host-modal-container">
        <button
            v-show="hostRequestStatus !== 0"
            @click="hostModalClose"
            class="col-auto close-btn"
        >
            <img src="@/assets/images/ic_close.png" alt="Close" class="close-img" />
        </button>

        <div class="host-modal-content">
            <div class="host-title-con">
                <span class="host-title">{{ t("호스트 권한 요청") }}</span>
            </div>
            <div class="title-under-line"></div>

            <div
                v-if="hostRequestStatus === 0"
                class="content"
            >
                <div class="request-status host-request-message">
                    <div>
                        <p>
                            <span class="msg request-nickname">{{
                                hostRequestNickname
                            }}</span>
                            <span class="msg request-text">{{ t("님이") }}</span>
                        </p>
                    </div>
                    <div>
                        <span class="msg request-text">{{ t("호스트 권한 요청을 보냈습니다") }}</span>
                    </div>
                </div>
                <div class="host-request-buttons">
                    <button
                        class="host-request-accept-button"
                        @click="hostRequestResult('accept')"
                    >
                        {{ t("수락") }}
                    </button>
                    <button
                        class="host-request-decline-button"
                        @click="hostRequestResult('reject')"
                    >
                        {{ t("거절") }}
                    </button>
                </div>
            </div>

            <div
                v-else-if="hostRequestStatus === 1"
                class="content"
            >
                <div
                    class="request-status host-request-message"
                >
                    <div>
                        <p class="msg request-text">{{ t("호스트 권한 요청을 보냈습니다") }}</p>
                    </div>
                    <div>
                        <span class="msg request-text">{{ t("수락 대기중입니다") }}</span>
                    </div>
                </div>
            </div>

            <div
                v-else
                class="content"
            >
                <div
                    class="request-status host-request-message"
                >
                    <div>
                        <p class="msg request-text">{{ t("상대방이 권한 요청을") }}</p>
                    </div>
                    <div>
                        <span class="msg request-text">{{
                            t("거절했습니다")
                        }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useModalStore } from "@/stores/modal";
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";

// i18n 훅 사용
const { t } = useI18n();

const callStore = useCallStore();
const modalStore = useModalStore();
const chattingStore = useChattingStore();

const hostRequestNickname = computed(() => callStore.hostRequestNickname);
const hostRequestStatus = computed(() => callStore.hostRequestStatus);

function hostModalClose() {
    // host Request Cancel
    if (hostRequestStatus.value === 1) {
        callStore.setHostCancelFlag(true);
    }
    modalStore.closeModal("host"); // Vue Final Modal 닫기 (name이 'hostModal'인 모달)
};

const hostRequestResult = (result) => {
    callStore.setHostRequestResult(result);
};

// mounted 훅
onMounted(() => {
});
</script>

<style lang="scss" scoped>
p {
    margin: 0 0 0 !important;
}

.host-modal-container {
    float: none !important;
    width: 100%;
    height: 100%;
    padding: 40px 27px 27px 27px;
    box-sizing: border-box;
	background-color: #262627;
	color: #fff;

	button {
		color: #fff;
	}
    @media all and (max-width: 767px) {
        padding: 20px 27px 50px 27px;
    }
}

.host-modal-content {
    height: 100%;
}

.close-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    background: none; // 버튼 기본 스타일 제거
    border: none; // 버튼 기본 스타일 제거
    cursor: pointer;
}

.close-img {
    width: 14px;
}

.host-title-con {
    display: flex; // 수평 정렬을 위해 추가
}

.host-title {
    font-size: 22px;
    margin-bottom: 3px;
    font-weight: bolder;
    text-align: center; // 텍스트 중앙 정렬
}

.title-under-line {
    /* 라인 스타일 추가 */
    width: 100%;
    border: 1px solid #323232;
    background-color: #eee;
}

.msg {
    /* 공통 메시지 스타일 */
}

.content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: inherit;
    box-sizing: border-box;

}

.request-status {
    display: flex; // 내부 요소들을 위한 flex
    flex-direction: column; // 세로로 쌓기
    align-items: center; // 내용 중앙 정렬
    width: 100%; // 부모 너비에 맞춤

    > div {
        /* 각 메시지 줄에 대한 스타일 */
        &:first-child {
            margin: auto; // 가운데 정렬
        }
        &:last-child {
            width: auto;
            margin: auto; // 가운데 정렬
        }
    }
}

.request-nickname {
    font-weight: bolder;
    margin-right: 3px;
    font-size: 15px;
}
.request-text {
    font-size: 14px;
    line-height: 24px;
}

.host-request-buttons {
    padding-left: 10px;
    display: flex; // 버튼들을 가로로 정렬
    justify-content: center; // 버튼들 중앙 정렬
    margin-top: 20px; // 메시지와 버튼 사이 간격

    > button {
        padding: 6px 22px;
        margin-right: 10px;
        font-size: 13px;
        border-radius: 15px;
        border: 1px solid #ddd; // 기본 테두리
        background-color: #fff; // 기본 배경
        cursor: pointer;

        &:last-child {
            margin-right: 0; // 마지막 버튼은 오른쪽 마진 없음
        }
    }

    .host-request-accept-button {
        background-color: #007bff; // 수락 버튼 색상 예시
        color: #fff;
        border-color: #007bff;
    }

    .host-request-decline-button {
        background-color: #f0f0f0; // 거절 버튼 색상 예시
        color: #333;
        border-color: #f0f0f0;
    }
}
</style>
