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
                    <option :value="false">{{ t("없음") }}</option>
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
                    <option :value="false">{{ t("없음") }}</option>
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
                    <option :value="-1">{{ t("없음") }}</option>
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
                <button class="applyBtn" @click="apply()">
                    <span>{{ t("적용") }}</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useCommonStore } from "@/stores";
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
    func: Function
});

let audioList = ref([]);
let micList = ref([]);
let camList = ref([]);
let selectedAudio = ref("");
let selectedMic = ref("");
let selectedCam = ref("");
let checked = ref(false);
let showCloseBtn = ref(true);
let savedAudioId = ref(false);
let savedMicId = ref(false);
let savedCamIndex = ref(0);
let onlyVoiceId = ref(false);
let loaded = ref(false);
let selectedAudioIdExist = ref(true);
let selectedMicIdExist = ref(true);

const commonStore = useCommonStore();
const callStore = useCallStore();
const modalStore = useModalStore();

onMounted(() => {
    getMediaList();
    console.log(props.func)
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

function getMediaList() {
    console.log("*** get media devices");
    let filterAudio;
    let filterMic;
    let filterCam;
    navigator.mediaDevices.enumerateDevices({ audio: true, video: true}).then((devices) => {
        // communications의 경우에는 통화 전용으로 discord의 경우에는 살려두지만, zoom의 경우에는 제거함. 나는 communications의 음질에서 이질감이 느껴져서 제거함
        filterAudio = devices.filter(
            (device) =>
                device.kind === "audiooutput" && device.deviceId != "communications",
        );
        filterMic = devices.filter(
            (device) =>
                device.kind === "audioinput" && device.deviceId != "communications",
        );
        filterCam = devices.filter(
            (device) =>
                device.kind === "videoinput" && device.deviceId != "communications",
        );

        console.log(devices);

        audioList.value = removeDuplicated(filterAudio, 1);
        micList.value = removeDuplicated(filterMic, 2);
        camList.value = removeDuplicated(filterCam, 3);
        checkDevices();
    });
}
function removeDuplicated(deviceList, type) {
    const seenGroupId = new Set();
    const seenDeviceId = [];
    const uniqueGroup = [];
    console.log(`*** remove duplicated ids list length: ${deviceList.length}`);
    if (deviceList.length == 0) {
        switch (type) {
            case 1:
                selectedAudioIdExist.value = false;
                selectedAudioID.value = false;
                return;
            case 2:
                selectedMicIdExist.value = false;
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

    // 기존에 지정해둔 device가 사라진 경우 체크
    if (type == 1) {
        if (savedAudioId != false) {
            selectedAudioIdExist.value = seenDeviceId.includes(savedAudioId)
                ? true
                : false;
        } else {
            selectedAudioIdExist.value = true;
        }
    } else if (type == 2) {
        if (savedMicId != false) {
            selectedMicIdExist.value = seenDeviceId.includes(savedMicId) ? true : false;
        } else {
            selectedMicIdExist.value = true;
        }
    }
    return uniqueGroup;
}
function checkDevices() {
    if (selectedAudio.value == "") {
        let deviceId = undefined;
        // 기존에 선택한 오디오값이 있고, 해당 오디오가 존재하는 경우
        if (selectedAudioIdExist.value && savedAudioId.value) {
            deviceId = savedAudioId.value;
        } else {
            deviceId =
                audioList.value && audioList.value[0]
                    ? audioList.value[0].deviceId
                    : false;
        }
        selectedAudio.value = deviceId;
    }
    if (selectedMic.value == "") {
        let deviceId = undefined;
        // 기존에 선택한 마이크가 있고, 해당 마이크가 존재하는 경우
        if (selectedMicIdExist.value && savedMicId.value) {
            deviceId = savedMicId.value;
        } else {
            deviceId =
                micList.value && micList.value[0] ? micList.value[0].deviceId : false;
        }
        selectedMic.value = deviceId;
    }
    if (selectedCam.value == "") {
        let deviceIndex = 0;
        if (savedCamIndex.value && savedCamIndex.value != "undefined") {
            console.log(savedCamIndex);
            deviceIndex = savedCamIndex.value;
        }
        // -1은 선택안함임
        if (deviceIndex == -1 || deviceIndex == undefined) {
            selectedCam.value = -1;
        } else {
            if (camList.value[deviceIndex].deviceId) {
                selectedCam.value = camList.value[deviceIndex].deviceId;
            } else {
                selectedCam.value =
                    camList.value && camList.value[0]
                        ? camList.value[deviceIndex].deviceId
                        : -1;
            }
        }
    }
    loaded.value = true;
}
function apply() {
    if (!loaded.value)
        setTimeout(() => {
            loaded.value = true;
            apply();
        });
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
    alert(props.type)
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
