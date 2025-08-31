<template>
    <div class="fileSendModalContainer">
        <button
            @click="fileSendModalClose"
            v-if="fileSendStatus != 2 && fileSendStatus != 3"
            class="col-auto closeBtn"
        >
            <img
                src="@/assets/images/ic_close.png"
                alt="Close"
                class="closeImg"
            />
        </button>

        <div class="alert-box" v-if="fileSendStatus == 0">
            <div class="row col-12 fileSendTitleCon">
                <span class="col-auto fileSendTitle">{{ $t("사진 전송") }}</span>
                <span class="col fileSendExplanation">{{
                    $t("사진을 수신할 사용자를 선택해주세요")
                }}</span>
            </div>
            <div class="col-12 titleUnderLine"></div>
            <div class="row col-12 fileSendMessageBox items-center justify-center">
                <div class="row requestStatus fileSendMessage col-12">
                    <div>
                        <select
                            v-model="selected"
                            @change="
                                selected != ''
                                    ? (userSelectNone = false)
                                    : (userSelectNone = true)
                            "
                            class="userSelect"
                        >
                            <option disabled value="">{{ $t("사용자를 선택해주세요") }}</option>
                            <option
                                v-show="contents?.status != 'none' && contents?.text != ''"
                                v-for="(contents, contentsKey) in callingUser"
                                :key="contentsKey"
                                :value="contents.deviceid"
                                
                            >
                                {{ contents.nickname }}
                            </option>
                        </select>
                    </div>
                    <div class="col-12 notSelectedText">
                        <p v-if="userSelectNone && fileSendStatus == 0">
                            {{ $t("사용자가 선택되지 않았습니다") }}
                        </p>
                    </div>
                </div>
                <div class="fileSendRequestbuttons">
                    <button
                        v-on:click="
                            selected != ''
                                ? selectSender(selected)
                                : (userSelectNone = true)
                        "
                        class="fileSendRequestaccenptButton confirm"
                    >
                        {{ $t("확인") }}
                    </button>
                    <button
                        @click="fileSendModalClose"
                        class="fileSendRequestadelineButton cancel"
                    >
                        {{ $t("취소") }}
                    </button>
                </div>
            </div>
        </div>

        <div  v-else-if="fileSendStatus == 1">
            <div class="row col-12 fileSendTitleCon">
                <span class="col-auto fileSendTitle">{{ $t("사진 전송") }}</span>
                <span class="col fileSendExplanation">{{
                    $t("사진을 선택해주세요")
                }}</span>
            </div>
            <div class="col-12 titleUnderLine"></div>
            <div class="row col-12 fileSendMessageBox items-center justify-center">
                <div class="fileSelectContainer">
                    <div>
                        <div class="fileSelect">
                            <label for="file" id="fileInput" class="fileLabel">{{
                                $t("파일 선택")
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
                                class="fileName"
                            />
                        </div>
                    </div>
                    <div class="col-12 notSelectedText">
                        <p
                            v-show="
                                selectFileName == '' && fileSelectNone == true
                                    ? (fileSelectNone = true)
                                    : (fileSelectNone = false && fileSendStatus == 1)
                            "
                        >
                            {{ $t("선택된 파일이 없습니다") }}
                        </p>
                    </div>
                </div>
                <div class="fileSendRequestbuttons">
                    <button
                        v-on:click="
                            selectFileName != ''
                                ? fileSelectComplete()
                                : (fileSelectNone = true)
                        "
                        class="fileSendRequestaccenptButton confirm"
                    >
                        {{ $t("확인") }}
                    </button>
                    <button
                        @click="fileSendModalClose"
                        class="fileSendRequestadelineButton cancel"
                    >
                        {{ $t("취소") }}
                    </button>
                </div>
            </div>
        </div>

        <div  v-else-if="fileSendStatus == 2">
            <div class="fileSendMessageBox items-center justify-center">
                <div class="fileSelectContainer">
                    <div class="row col-12">
                        <div class="col-12 fileSendWaitText">
                            <p>{{ $t("상대방의 수락을 기다리는 중입니다") }}</p>
                        </div>
                        <div class="col-12 fileSendWaitText">
                            <p>{{ $t("잠시만 기다려주세요") }}</p>
                        </div>
                    </div>
                </div>
				<div class="fileSendRequestbuttons">
                    <button
                        @click="cancelFileTransfer"
                        class="fileSendRequestadelineButton cancel"
                    >
                        {{ $t("취소") }}
                    </button>
                </div>
            </div>
        </div>

        <div  v-else-if="fileSendStatus == 3">
            <div class="fileSendMessageBox items-center justify-center">
                <div>
					<div class="col-12 fileSendWaitText">
						<p>{{ $t("사진을 전송 중입니다") }}</p>
					</div>
					<div class="col-12 fileSendWaitText">
						<p>{{ $t("잠시만 기다려주세요") }}</p>
					</div>
				</div>
				<div class="prog">
					<div
						id="progressing"
						class="progs"
						:style="{ width: TransmissionRate + '%' }"
					></div>
				</div>
				<div class="fileSendRequestbuttons">
                    <button
                        @click="cancelFileTransfer"
                        class="fileSendRequestadelineButton cancel"
                    >
                        {{ $t("취소") }}
                    </button>
                </div>
            </div>
        </div>

        <div  v-else-if="fileSendStatus == 4">
            <div class="fileSendMessageBox items-center justify-center">
                <div class="row">
					<div class="col-12 fileSendWaitText">
						<p>{{ $t("상대방이 사진 수신 요청을") }}</p>
					</div>
					<div class="col-12 fileSendWaitText">
						<p>{{ $t("거절했습니다") }}</p>
					</div>
				</div>
            </div>
        </div>

        <div  v-else-if="fileSendStatus == 6">
            <div class="row col-12 fileSendMessageBox items-center justify-center">
                <div class="fileSendingContainer">
                    <div class="row col-12 justify-center">
                        <div class="col-12 fileSendWaitText">
                            <img
                                src="@/assets/images/ic_complete_3.png"
                                class="fileSendComplete"
                                alt="Complete"
                            />
                        </div>
                        <div class="col-12 fileSendWaitText">
                            <p>{{ $t("전송이 완료되었습니다") }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div  v-else-if="fileSendStatus == 7">
            <div class="row col-12 fileSendMessageBox items-center justify-center">
                <div class="fileSendingContainer">
                    <div class="row col-12 justify-center">
                        <div class="col-12 fileSendWaitText">
                            <img
                                src="@/assets/images/ic_complete_3.png"
                                class="fileSendComplete"
                                alt="Complete"
                            />
                        </div>
                        <div class="col-12 fileSendWaitText">
                            <p>{{ $t("전송이 취소되었습니다") }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useCommonStore } from "@/stores";
import { useCallStore } from "@/stores/call";
import { useModalStore } from "@/stores/modal";
import { useNuxtApp } from "nuxt/app";
import { onBeforeMount, onMounted, ref } from "vue";
const { $t } = useNuxtApp()
const callStore = useCallStore();
const commonStore = useCommonStore();
const modalStore = useModalStore();

const userSelectNone = ref(false);
const fileSelectNone = ref(false);
const selected = ref("");
const selectFileName = ref("");
const displayMode = ref('darkmode');
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
    modalStore.closeModal("fileSend")
    commonStore.fileSend();
    commonStore.setFileSendStatus(0);
    commonStore.setFileModalFlag(false); // 파일 송수신 팝업 flag 초기화
}
function fileSelect() {
	console.log(uploadFiles)
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
                        $t("외")[1] +
                        (selectCnt - 1) +
                        $t("개")[2];
                }

                // =>kyj
                // file vuex data 저장
                commonStore.setSendFileData(uploadFiles.value.files);
            }
        } else {
            alert("jpg, jpeg, png," + $t("fileSend extension")[0]);
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
        callStore.onlyVoiceID.includes(
            sessionStorage.getItem("m_local_deviceid"),
        ) ||
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

select {
    width: 190px;
    font-size: 13px;
    padding: 0.7em 1em;
    -webkit-appearance: none; // 웹킷 브라우저 (크롬, 사파리)
    -moz-appearance: none; // 모질라 브라우저 (파이어폭스)
    appearance: none; // 표준 속성
    border: 1px solid #3d3d3d;
    color: #f0f0f0;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAALCAYAAACksgdhAAAABHNCSVQICAgIfAhkiAAAANVJREFUKFNj7Onp2cHAwOAOxMSCnYydnZ2azMzM54E62InQ9fPv37+GjCCF3d3dHYyMjOWENP3//7+ztLS0AqwJaBsvExPTFaBGOVwagRoe/fv3T6e8vPwzWBPUtgigpuV4NEUCbVkBkodrgmrcDdTogq4RaMseoAZXmDiKJmigXAZKMiNpBPr9ry7QWdexagIJAqNgApDKR9I0saSkpADZdhSbkALlLtCZokBnvQZ6XhnkebyaQJK9vb0JQA3zgRoTi4uLF6D7EcMmpNCcDPR8LrbQBADFP1QsZrf9VAAAAABJRU5ErkJggg==) no-repeat 94% 52%/12px #323232;
}

/* 파일 전송 완료 이미지 */
.fileSendComplete {
    float: initial;
}

/* 진행 바 컨테이너 */
.prog {
	width: 80%;
    margin-top: 10px;
    height: 15px;
    border-radius: 15px;
	background-color: #505050;
}

/* 진행 바 내부 */
.progs {
    height: 8px;
    text-align: center;
    line-height: 50px; // 진행바 내부에 텍스트가 없다면 의미가 없습니다.
    border-radius: 15px;
	background-color: #2a8bf4;
}

/* 파일 전송 모달 컨테이너 */
.fileSendModalContainer {
	background-color: #262627;
    float: none !important;
    width: 100%;
    height: 100%;
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.45); // 투명도 있는 색상으로 변경
	color: #fff;
	padding: 38px 28px;
	box-sizing: border-box;

    /* 닫기 버튼 */
    .closeBtn {
        position: absolute;
        top: 5px;
        right: 0px;

        .closeImg {
            width: 14px;
        }
    }

    /* 파일 전송 제목 */
    .fileSendTitle {
        font-size: 18px;
        font-weight: bolder;
        margin: 5px 10px 0px 5px;
    }

    /* 파일 전송 설명 */
    .fileSendExplanation {
        line-height: 30px;
    }

    /* 제목 아래 라인 (비어있음 - 필요 시 스타일 추가) */
    .titleUnderLine {
		height: 1px;
        border-bottom: 1px solid #4d4d4d; // 예시
    }
    /* 파일 전송 메시지 박스 */
    .fileSendMessageBox {
        text-align: center;
        height: 200px;
		display: flex;
		flex-direction: column;
    }

    /* 요청 상태 공통 스타일 */
    .requestStatus {
        padding-top: 30px;

        > div {
            &:first-child {
                margin: auto;
            }
            &:last-child {
                width: auto;
                margin: auto;
            }
        }
    }

    /* 요청 닉네임 */
    .requestNickName {
        font-weight: bolder;
        margin-right: 3px;
        font-size: 15px;
    }

    /* 요청 텍스트 */
    .requestText {
        font-size: 14px;
        line-height: 24px;
    }

	.fileSelect {
		display: flex;
	}

    /* 파일 전송 요청 버튼들 컨테이너 */
    .fileSendRequestbuttons {
        position: absolute;
    	bottom: 65px;

		button + button {
			margin-left: 10px;
		}
		> button {
			color: white;
			padding: 6px 22px;
			font-size: 13px;
			border-radius: 15px;
			&.confirm {
				background-color: #1c8eff;
			}
			&.cancel {
				background-color: #464646;
			}
		}
    }

    /* 선택되지 않은 텍스트 */
    .notSelectedText {
        margin: 10px auto !important;
		color: yellow;

        > p {
            font-weight: 100;
            font-size: 12px !important;
        }
    }

    /* 파일 송신 컨테이너 */
    .fileSendingContainer {
        margin-top: 10px;
    }

    /* 파일 라벨 (input type="file"의 커스텀 버튼) */
    .fileLabel {
        font-size: 13px;
		border-radius: 6px;
		margin: 0px 12px 0px 12px;
		width: 100px;
		background-color: grey;
		line-height: 1.6;
		padding: 5px;
		cursor: pointer;
	}

    /* 파일 이름 입력 필드 */
    .fileName {
        width: 100%;
        height: 33px;
        padding-left: 8px;
		background-color: #343434;
		color: #fff;
    }

    /* 파일 전송 대기 텍스트 */
    .fileSendWaitText {
        margin: 8px auto !important;
        font-size: 17px;
		> img {
			margin-top: 10px;
		}
    }

    /* 파일 전송 대기/취소 버튼 컨테이너 */
    .filteSendWaitCancleBtn {
        > button {
            padding: 6px 22px;
            margin-right: 10px;
            font-size: 13px;
            border-radius: 15px;
        }
    }
}
</style>
