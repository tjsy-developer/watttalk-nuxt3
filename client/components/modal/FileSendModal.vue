<template>
    <div class="alert-container">
        <button
            v-if="fileSendStatus != 2 && fileSendStatus != 3"
            @click="fileSendModalClose"
            class="close-btn"
        >
            <img src="@/assets/images/ic_close.png" alt="Close" />
        </button>

        <div class="alert-box" v-if="fileSendStatus == 0">
            <div class="alert-title">
                <h4 class="title">
                    {{ t("사진 전송") }}
                </h4>
                <span class="">{{ t("사진을 수신할 사용자를 선택해주세요") }}</span>
            </div>
            <div class="division"></div>
            <section>
                <div class="content">
                    <select
                        v-model="selected"
                        @change="
                            selected != ''
                                ? (userSelectNone = false)
                                : (userSelectNone = true)
                        "
                        class="userSelect"
                    >
                        <option disabled value="">
                            {{ t("사용자를 선택해주세요") }}
                        </option>
                        <option
                            v-show="contents?.status != 'none' && contents?.text != ''"
                            v-for="(contents, contentsKey) in callingUser"
                            :key="contentsKey"
                            :value="contents.deviceid"
                        >
                            {{ contents.nickname }}
                        </option>
                    </select>
                    <p class="content msg" v-if="userSelectNone && fileSendStatus == 0">
                        {{ t("사용자가 선택되지 않았습니다") }}
                    </p>
                </div>
                <div class="control-buttons">
                    <button
                        @click="
                            selected != ''
                                ? selectSender(selected)
                                : (userSelectNone = true)
                        "
                        class="accept-btn"
                    >
                        {{ t("확인") }}
                    </button>
                    <button @click="fileSendModalClose" class="decline-btn">
                        {{ t("취소") }}
                    </button>
                </div>
            </section>
        </div>
        <div class="alert-box" v-if="fileSendStatus == 1">
            <div class="alert-title">
                <h4 class="title">
                    {{ t("사진 전송") }}
                </h4>
                 <span class="">{{ t("사진을 선택해주세요") }}</span>
            </div>
            <div class="division"></div>
            <section>
                <div class="content">
                    <div class="file-box">
                        <label for="file" id="fileInput" class="file-label">{{
                            t("파일 선택")
                        }}</label>
                        <input
                            v-show="false"
                            type="file"
                            accept=".jpg, .jpeg, .png"
                            @change="fileSelect"
                            id="file"
                            ref="uploadFiles"
                            style="display: none"
                        />
                        <input
                            type="text"
                            disabled
                            v-model="selectFileName"
                            class="file-input"
                        />
                    </div>
                    <p
                        class="content msg"
                        v-if="
                            selectFileName == '' && fileSelectNone == true
                                ? (fileSelectNone = true)
                                : (fileSelectNone = false && fileSendStatus == 1)
                        "
                    >
                        {{ t("선택된 파일이 없습니다") }}
                    </p>
                </div>
                <div class="control-buttons">
                    <button
                        @click="
                            selectFileName != ''
                                ? fileSelectComplete()
                                : (fileSelectNone = true)
                        "
                        class="accept-btn"
                    >
                        {{ t("확인") }}
                    </button>
                    <button @click="fileSendModalClose" class="decline-btn">
                        {{ t("취소") }}
                    </button>
                </div>
            </section>
        </div>

        <div class="alert-box" v-else-if="fileSendStatus == 2">
            <section>
                <div class="content">
                    <p class="msg alert-text">
                        {{ t("상대방의 수락을 기다리는 중입니다") }}
                    </p>
                    <p class="msg alert-text">
                        {{ t("잠시만 기다려주세요") }}
                    </p>
                </div>
                <div class="control-buttons">
                    <button @click="cancelFileTransfer" class="decline-btn">
                        {{ t("취소") }}
                    </button>
                </div>
            </section>
        </div>

        <div class="alert-box" v-else-if="fileSendStatus == 3">
            <section>
                <div class="content">
                    <p class="msg alert-text">
                        {{ t("사진을 전송 중입니다") }}
                    </p>
                    <p class="msg alert-text">
                        {{ t("잠시만 기다려주세요") }}
                    </p>
                </div>
                <div class="prog">
                    <div
                        id="progressing"
                        class="progs"
                        :style="{ width: TransmissionRate + '%' }"
                    ></div>
                </div>
                <div class="control-buttons">
                    <button @click="cancelFileTransfer" class="decline-btn">
                        {{ t("취소") }}
                    </button>
                </div>
            </section>
        </div>

        <div class="alert-box" v-else-if="fileSendStatus == 4">
            <section>
                <div class="content">
                    <p class="msg alert-text">
                        {{ t("상대방이 사진 수신 요청을") }}
                    </p>
                    <p class="msg alert-text">
                        {{ t("거절했습니다") }}
                    </p>
                </div>
            </section>
        </div>
        <div class="alert-box" v-else-if="fileSendStatus == 6">
            <section>
                <div class="content">
                    <img
                        src="@/assets/images/ic_complete_3.png"
                        class="file-status-img"
                        alt="Complete"
                    />
                    <p class="msg alert-text">
                        {{ t("전송이 완료되었습니다") }}
                    </p>
                </div>
            </section>
        </div>
        <div class="alert-box" v-else-if="fileSendStatus == 7">
            <section>
                <div class="content">
                    <img
                        src="@/assets/images/ic_complete_3.png"
                        class="file-status-img"
                        alt="Complete"
                    />
                    <p class="msg alert-text">
                        {{ t("전송이 취소되었습니다") }}
                    </p>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { useCommonStore } from "@/stores";
import { useCallStore } from "@/stores/call";
import { useModalStore } from "@/stores/modal";
import { useNuxtApp } from "nuxt/app";
import { onBeforeMount, onMounted, ref } from "vue";
const { t } = useI18n();
const callStore = useCallStore();
const commonStore = useCommonStore();
const modalStore = useModalStore();

const userSelectNone = ref(false);
const fileSelectNone = ref(false);
const selected = ref("");
const selectFileName = ref("");
const displayMode = ref("darkmode");
const uploadFiles = ref(null);

onMounted(() => {
    if (fileSendStatus.value == 0) {
        commonStore.setFileModalFlag(true);
    }
});
onBeforeMount(() => {
    checkOnlyVoice();
});

const callingUser = computed(() => commonStore.callingUser);
const fileSendStatus = computed(() => commonStore.fileSendStatus);
const TransmissionRate = computed(() => callStore.TransmissionRate);

watch(fileSendStatus, (newStatus) => {
    if (newStatus === 1) {
        const fileInputEl = document.getElementById("fileInput");
        if (fileInputEl) {
            fileInputEl.click();
        } else {
            console.warn("fileInput 요소를 찾을 수 없습니다.");
        }
    } else if (newStatus === 6) {
        setTimeout(() => {
            fileSendModalClose(); // 컴포넌트 내부의 메서드 호출
        }, 3000);
    }
});

function fileSendModalClose() {
    modalStore.closeModal("fileSend");
    commonStore.fileSend();
    commonStore.setFileSendStatus(0);
    commonStore.setFileModalFlag(false); // 파일 송수신 팝업 flag 초기화
}
function fileSelect() {
    console.log(uploadFiles);
    const selectCnt = uploadFiles.value.files.length;
    const acceptFileType = ["jpg", "jpeg", "png"]; // 파일 송수신 허용 확장자

    for (let i = 0; i < selectCnt; i++) {
        const fileType = uploadFiles.value.files[i].name.lastIndexOf(".");
        const selectFileType = uploadFiles.value.files[i].name
            .substring(fileType + 1)
            .toLowerCase();

        // 올바른 확장자인지 파일 검토
        if (acceptFileType.includes(selectFileType)) {
            if (i == selectCnt - 1) {
                if (selectCnt == 1) {
                    selectFileName.value = uploadFiles.value.files[0].name;
                } else {
                    selectFileName.value =
                        uploadFiles.value.files[0].name +
                        t("외")[1] +
                        (selectCnt - 1) +
                        t("개")[2];
                }

                // =>kyj
                // file vuex data 저장
                commonStore.setSendFileData(uploadFiles.value.files);
            }
        } else {
            alert("jpg, jpeg, png," + t("fileSend extension")[0]);
            return false;
        }
    }
}
function selectSender(selectedUser) {
    commonStore.setFileSendStatus(1);
    commonStore.setFileReceiver(selectedUser);
}

function fileSelectComplete() {
    commonStore.setFileSendStatus(2);
    commonStore.setFileSendFlag(true);
}

// 파일 전송 취소(수락 대기중 일 경우만 가능)
function cancelFileTransfer() {
    commonStore.setCancelFileTransferFlag(true);
}

function checkOnlyVoice() {
    if (
        callStore.onlyVoiceID.includes(sessionStorage.getItem("m_local_deviceid")) ||
        callStore.cameraNotAllowed
    ) {
        callStore.setOnlyVoiceIDFileSent(true);
    }
}
</script>

<style lang="scss" scoped>
// SCSS 변수 정의 (필요에 따라 추가하세요)
$color-white: #fff;
$color-dark-gray: #262627;
$color-light-gray: #4d4d4d;
$color-blue: #1c8eff;
$color-text-light: #d6d6d6;

/* 전역 또는 기본 스타일 */
p {
    margin: 0 0 0 !important;
}

h4 {
    margin: 0;
}

select {
    width: 190px;
    font-size: 13px;
    padding: 0.7em 1em;
    -webkit-appearance: none; // 웹킷 브라우저 (크롬, 사파리)
    -moz-appearance: none; // 모질라 브라우저 (파이어폭스)
    appearance: none; // 표준 속성
    border: 1px solid #3d3d3d;
    color: #f0f0f0;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAALCAYAAACksgdhAAAABHNCSVQICAgIfAhkiAAAANVJREFUKFNj7Onp2cHAwOAOxMSCnYydnZ2azMzM54E62InQ9fPv37+GjCCF3d3dHYyMjOWENP3//7+ztLS0AqwJaBsvExPTFaBGOVwagRoe/fv3T6e8vPwzWBPUtgigpuV4NEUCbVkBkodrgmrcDdTogq4RaMseoAZXmDiKJmigXAZKMiNpBPr9ry7QWdexagIJAqNgApDKR9I0saSkpADZdhSbkALlLtCZokBnvQZ6XhnkebyaQJK9vb0JQA3zgRoTi4uLF6D7EcMmpNCcDPR8LrbQBADFP1QsZrf9VAAAAABJRU5ErkJggg==)
        no-repeat 94% 52%/12px #323232;
}

/* 파일 전송 완료 이미지 */
.file-status-img {
    float: initial;
    margin-bottom: 26px;
}

/* 진행 바 컨테이너 */
.prog {
    margin: auto;
    width: 80%;
    margin-top: 10px;
    height: 15px;
    border-radius: 15px;
    background-color: #505050;
}

/* 진행 바 내부 */
.progs {
    height: inherit;
    text-align: center;
    line-height: 50px; // 진행바 내부에 텍스트가 없다면 의미가 없습니다.
    border-radius: 15px;
    background-color: #2a8bf4;
}

p {
    margin: 0 0 0 !important;
}

.alert-container {
    position: relative;
    float: none !important;
    width: 430px;
    height: 326px;
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
    }
}

.alert-title {
    width: 100%;
    text-align: left;
    display: flex;
    align-items: end;
    gap: 10px;
    color: #fff;
    > span {
        font-size: 14px;
        margin-bottom: 4px;
    }
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
