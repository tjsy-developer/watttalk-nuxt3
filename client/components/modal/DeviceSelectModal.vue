<template>
    <div class="mainWrap">
        <div class="modalHeader">
            <span>{{ t("카메라/마이크 설정") }}</span>
            <img src="@/assets/images/darkmode/modal/ic_device_setup.svg" />
        </div>
        <div class="divisionLine"></div>
        <div class="body">
            <div class="selectionRow">
                <div class="nameWrap">
                    <span>{{ t("오디오") }}:</span>
                </div>
                <select class="selectBox" v-model="selectedAudio">
                    <option
                        v-for="(text, index) in audioList"
                        :key="index"
                        :value="text.deviceId"
                    >
                        {{ text.label }}
                    </option>
                </select>
            </div>
            <div class="selectionRow">
                <div class="nameWrap">
                    <span>{{ t("마이크") }}:</span>
                </div>
                <select class="selectBox" v-model="selectedMic">
                    <option
                        v-for="(text, index) in micList"
                        :key="index"
                        :value="text.deviceId"
                    >
                        {{ text.label }}
                    </option>
                </select>
            </div>
            <div class="selectionRow">
                <div class="nameWrap">
                    <span>{{ t("카메라") }}:</span>
                </div>
                <select class="selectBox" v-model="selectedCam" id="camInput">
                    <option
                        v-for="(text, index) in camList"
                        :key="index"
                        :value="text.deviceId"
                    >
                        {{ text.label }}
                    </option>
                </select>
            </div>
            <div class="optionWrap2">
                <input
                    class="closeOneDayBtn"
                    type="checkbox"
                    :value="false"
                    v-model="checked"
                />
                <span>{{ t("영상통화 시작 시 카메라, 마이크 설정창 표시") }}</span>
            </div>
        </div>
        <div class="footer">
            <div class="buttonWrap">
                <button class="closeBtn" v-if="showCloseBtn" @click.stop="close()">
                    {{ t("취소") }}
                </button>
                <button class="applyBtn" @click="apply()" :disabled="!loaded">
                    <span>{{ t("적용") }}</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { common } from "@/assets/images";
import { useRoomStore } from "@/stores/room";
import { useCallStore } from "@/stores/call";
import { useModalStore } from "@/stores/modal";
import { deleteCookie, setCookie } from "@/utils/common";
import { useNuxtApp } from "nuxt/app";
import { onMounted } from "vue";
const { t } = useI18n();

const props = defineProps({
    type: String,
    deviceId: String,
    requestCall: Function,
    func: Function,
});

let audioList = ref([]);
let micList = ref([]);
let camList = ref([]);
let selectedAudio = ref("");
let selectedMic = ref("");
let selectedCam = ref("");
let checked = ref(true);
let showCloseBtn = ref(true);
let savedAudioId = ref(false);
let savedMicId = ref(false);
let savedCamIndex = ref(0);
let onlyVoiceId = ref(false);
let loaded = ref(false);
let selectedAudioIdExist = ref(true);
let selectedMicIdExist = ref(true);

const commonStore = useRoomStore();
const callStore = useCallStore();
const modalStore = useModalStore();

onMounted(() => {
    getMediaList();
});
function close(type) {
    if (!type) {
        modalStore.closeModal("device");
        return;
    }

    if (checked.value == false) {
        console.log("close deviceModal permanant");
        setCookie("closeDeviceModalPermanant", true, 1000);
    } else if (checked.value == true) {
        deleteCookie("closeDeviceModalPermanant");
    }
    // type이 있는 경우는 이미 checkParameter 함수를탐
    if (type != 1) {
        checkParameter();
    }
    modalStore.closeModal("device");
}

async function getMediaList() {
    try {
        // ✅ 2. 장치 목록 불러오기
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log("devices", devices);

        const filterAudio = devices.filter(
            (device) =>
                device.kind === "audiooutput" &&
                device.deviceId !== "communications" &&
                device.deviceId,
        );
        const filterMic = devices.filter(
            (device) =>
                device.kind === "audioinput" &&
                device.deviceId !== "communications" &&
                device.deviceId,
        );
        const filterCam = devices.filter(
            (device) =>
                device.kind === "videoinput" &&
                device.deviceId !== "communications" &&
                device.deviceId,
        );

        audioList.value = removeDuplicated(filterAudio, 1) || [];
        micList.value = removeDuplicated(filterMic, 2) || [];
        camList.value = removeDuplicated(filterCam, 3) || [];

        selectedAudio.value = commonStore.selectedAudioID;
        selectedMic.value = commonStore.selectedMicID;
        selectedCam.value = commonStore.selectedCamID;

        // ✅ 3. 반응형 데이터 반영 후 실행
        await nextTick();
    } catch (error) {
        console.error("장치 불러오기 실패:", error);
    } finally {
        checkDevices();
    }
}
function removeDuplicated(deviceList, type) {
    const seenGroupId = new Set();
    const seenDeviceId = [];
    const uniqueGroup = [];
    console.log(`*** remove duplicated ids list length: ${deviceList.length}`);
    if (deviceList.length == 0) {
        switch (type) {
            case 1:
                selectedAudio.value = false;
                return;
            case 2:
                selectedMic.value = false;
                return;
            case 3:
                selectedCam.value = -1;
                return;
        }
        return;
    }
    // deviceId는 다르지만, 동일한 device가 2개 뜨는 경우가 있어 groupId로 확인 (특히 default의 경우)
    deviceList.forEach((ele) => {
        if (!seenGroupId.has(ele.groupId)) {
            seenGroupId.add(ele.groupId);
            uniqueGroup.push(ele);
            seenDeviceId.push(ele.deviceId);
        }
    });

    return uniqueGroup;
}

function checkDevices() {
    console.log("선택된거", selectedAudio.value, selectedMic.value, selectedCam.value);
    console.log("옵션리스트", audioList.value, micList.value, camList.value);

    if (audioList.value.length == 0) {
        selectedAudio.value = false;
        audioList.value.unshift({ deviceId: false, label: t("없음") });
    } else if (selectedAudio.value) {
        const findAudioIndx = audioList.value?.findIndex((item) => {
            return item.deviceId === selectedAudio.value;
        });
        if (findAudioIndx == -1) {
            selectedAudio.value = false;
            audioList.value.unshift({ deviceId: false, label: t("없음") });
        }
    } else {
        selectedAudio.value = audioList.value[0].deviceId;
    }

    if (micList.value.length == 0) {
        selectedMic.value = false;
        micList.value.unshift({ deviceId: false, label: t("없음") });
    } else if (selectedMic.value) {
        const findMicIndx = micList.value?.findIndex((item) => {
            return item.deviceId === selectedMic.value;
        });
        if (findMicIndx == -1) {
            selectedMic.value = false;
            micList.value.unshift({ deviceId: false, label: t("없음") });
        }
    } else {
        selectedMic.value = micList.value[0].deviceId;
    }

    if (camList.value.length == 0) {
        selectedCam.value = false;
        camList.value.unshift({ deviceId: false, label: t("없음") });
    } else if (selectedCam.value) {
        const findMicIndx = camList.value?.findIndex((item) => {
            return item.deviceId === selectedCam.value;
        });
        if (findMicIndx == -1) {
            selectedCam.value = false;
            camList.value.unshift({ deviceId: false, label: t("없음") });
        }
    } else {
        selectedCam.value = camList.value[0].deviceId;
    }
    loaded.value = true;
}
function apply() {
    const modified = compare();
    console.log(`*** modified: ${modified}`);
    console.log(selectedAudio.value);
    console.log(selectedMic.value);
    if (!modified) {
        commonStore.setDeviceModifyState(false);
        checkParameter();
        return;
    }
    if (selectedCam.value == -1) {
        console.log("*** no cam selected set no cam !");
        callStore.setCameraNotAllowed(true);
    } else {
        callStore.setCameraNotAllowed(false);
    }
    const audioPrams = {
        type: 0,
        id: selectedAudio.value,
    };
    const micParams = {
        type: 1,
        id: selectedMic.value,
    };

    let camIndex = -1;
    if (camList.value && camList.value.length > 0) {
        camIndex = camList.value.findIndex((item) => {
            return item.deviceId === selectedCam.value;
        });
    }
    const camParams = {
        type: 2,
        id: selectedCam.value,
        index: camIndex,
    };
    commonStore.setMediaDevices(audioPrams);
    commonStore.setMediaDevices(micParams);
    commonStore.setMediaDevices(camParams);
    callStore.setCameraDeviceIndex(camIndex);
    commonStore.setDeviceModifyState(true);
    checkParameter();
}
function compare() {
    console.log("*** method: compareing devices");
    let camIndex = -1;
    if (camList.value && camList.value.length > 0) {
        camIndex = camList.value.findIndex((item) => {
            return item.deviceId === selectedCam.value;
        });
    }
    if (
        selectedAudio.value === commonStore.selectedAudioID &&
        selectedMic.value === commonStore.selectedMicID &&
        camIndex === commonStore.selectedCamIndex
    ) {
        return false;
    } else {
        return true;
    }
}
function checkParameter() {
    if (props.type == "request") {
        // 1:1 통화를 걸 경우
        props.requestCall();
    } else if (
        props.type == "openOwnMeeting" ||
        props.type == "openMeeting" ||
        props.type == "joinMeeting"
    ) {
        // 회의를 시작하거나 참여하는 경우
        props.func(props.type, props.seq);
    } else if (props.type == "directCall" || props.type == "acceptMeeting") {
        // 음성통화 참여 요청이 들어온 경우
        props.func(props.type);
    }
    close(1);
}
</script>

<style lang="scss" scoped>
.mainWrap {
    display: flex;
    flex-direction: column;
    justify-items: center;
    align-items: center;
    width: 430px;
    height: 514px;
    color: #fff;
    background-color: #262627;
}
.modalHeader {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 338px;
    height: 110px;
    font-weight: bold;
    font-size: 20px;
    span {
        text-align: left;
        font: normal normal 800 22px/26px NanumSquare;
        bottom: 21px;
        margin-bottom: 8px;
    }

    img {
        width: 142px;
        height: 73px;
        left: 30px;
    }
}
.divisionLine {
    width: 376px;
    height: 1px;
    border-bottom: 1px solid #4d4d4d;
}
.body {
    width: 90%;
    height: calc(100% - 175px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    // margin-bottom: 25px;

    .selectionRow {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 90%;
        margin-bottom: 22px;

        .nameWrap {
            width: 334px;
            text-align: left;
            margin-bottom: 3px;
        }

        .selectBox {
            width: 334px;
            height: 40px;
            background-color: #323232;
            border: 1px solid #3d3d3d;
        }
        &:last-child {
            margin-bottom: 18px;
        }
    }
    .optionWrap2 {
        width: 334px;
        display: flex;
        justify-content: flex-start;
        align-items: center;

        input {
            margin-right: 5px;
        }
    }
}

.footer {
    width: 334px;
    height: 65px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .buttonWrap {
        display: flex;
        justify-content: center;
        align-items: center;

        .closeBtn {
            width: 85px;
            height: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 20px;
            margin-right: 10px;
            background-color: #464646;
            color: #fff;
        }

        .applyBtn {
            width: 85px;
            height: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 20px;
            background-color: #1c8eff;
            color: #fff;
        }
    }
}
</style>
