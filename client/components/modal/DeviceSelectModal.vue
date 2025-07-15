<template>
    <div class="mainWrap">
        <div class="modalHeader">
            <span>{{ $t("deviceSetTitle") }}</span>
            <img :src="settingIcon" />
        </div>
        <div class="divisionLine"></div>
        <div class="body">
            <div class="selectionRow">
                <div class="nameWrap">
                    <span>{{ $t("audio") }}:</span>
                </div>
                <select class="selectBox" v-model="selectedAudio">
                    <option :value="false">{{ $t("selectDefault") }}</option>
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
                    <span>{{ $t("mic") }}:</span>
                </div>
                <select class="selectBox" v-model="selectedMic">
                    <option :value="false">{{ $t("selectDefault") }}</option>
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
                    <span>{{ $t("camera") }}:</span>
                </div>
                <select class="selectBox" v-model="selectedCam" id="camInput">
                    <option :value="-1">{{ $t("selectDefault") }}</option>
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
                <span>{{ $t("dontShowAgain") }}</span>
            </div>
        </div>
        <div class="footer">
            <div class="buttonWrap">
                <button class="closeBtn" v-if="showCloseBtn" @click="close">
                    {{ $t("cancel") }}
                </button>
                <button class="applyBtn" @click="apply()">
                    <span>{{ $t("apply") }}</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from "vue";

const props = defineProps({
    propsData: {
        type: Object, // 타입은 그대로 Object
        default: () => ({}), // propsData가 전달되지 않았을 때의 기본값 (객체는 함수로 반환)
    },
});

const audioList = ref([]);
const micList = ref([]);
const camList = ref([]);
const selectedAudio = ref("");
const selectedMic = ref("");
const selectedCam = ref("");
const checked = ref(false);
const showCloseBtn = ref(false);
const savedAudioId = ref(undefined);
const savedMicId = ref(undefined);
const savedCamIndex = ref(0);
const onlyVoiceId = ref(false);
const loaded = ref(false);
const selectedAudioIdExist = ref(true);
const selectedMicIdExist = ref(true);

onMounted(() => {
    getMediaList();
});
function close(type) {
    commonStore.setShowDeviceModal(false);
    if (checked == false) {
        console.log("close deviceModal permanant");
        setCookie("closeDeviceModalPermanant", true, 1000);
    } else if (checked == true) {
        deleteCookie("closeDeviceModalPermanant");
    }
    // type이 있는 경우는 이미 checkParameter 함수를탐
    if (type != 1) {
        checkParameter();
    }
    $modal.hide("deviceSelectModal");
}
function initData() {
    if (getCookie("closeDeviceModalPermanant") == "true") {
        checked = false;
    } else {
        checked = true;
    }
    if (propsData.close == true) {
        showCloseBtn = true;
    }
    if (
        $store.state.call.onlyVoiceID.includes(sessionStorage.getItem("m_local_deviceid"))
    ) {
        disableCamSelect();
    }
}
function getMediaList() {
    console.log("*** get media devices");
    let filterAudio;
    let filterMic;
    let filterCam;
    navigator.mediaDevices.enumerateDevices().then((devices) => {
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

        audioList = removeDuplicated(filterAudio, 1);
        micList = removeDuplicated(filterMic, 2);
        camList = removeDuplicated(filterCam, 3);
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
                selectedAudioIdExist = false;
                selectedAudioID = false;
                return;
            case 2:
                selectedMicIdExist = false;
                return;
            case 3:
                selectedCam = -1;
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
        if (savedAudioId != false && savedAudioId != "false") {
            selectedAudioIdExist = seenDeviceId.includes(savedAudioId) ? true : false;
        } else {
            selectedAudioIdExist = true;
        }
    } else if (type == 2) {
        if (savedMicId != false && savedMicId != "false") {
            selectedMicIdExist = seenDeviceId.includes(savedMicId) ? true : false;
        } else {
            selectedMicIdExist = true;
        }
    }
    return uniqueGroup;
}
function checkDevices() {
    if (selectedAudio == "") {
        let deviceId = undefined;
        // 기존에 선택한 오디오값이 있고, 해당 오디오가 존재하는 경우
        if (selectedAudioIdExist && savedAudioId) {
            deviceId = savedAudioId;
        } else {
            deviceId = audioList && audioList[0] ? audioList[0].deviceId : false;
        }
        selectedAudio = deviceId;
    }
    if (selectedMic == "") {
        let deviceId = undefined;
        // 기존에 선택한 마이크가 있고, 해당 마이크가 존재하는 경우
        if (selectedMicIdExist && savedMicId) {
            deviceId = savedMicId;
        } else {
            deviceId = micList && micList[0] ? micList[0].deviceId : false;
        }
        selectedMic = deviceId;
    }
    if (selectedCam == "") {
        let deviceIndex = 0;
        if (savedCamIndex && savedCamIndex != "undefined") {
            console.log(savedCamIndex);
            deviceIndex = savedCamIndex;
        }
        // -1은 선택안함임
        if (deviceIndex == -1 || deviceIndex == undefined) {
            selectedCam = -1;
        } else {
            if (camList[deviceIndex].deviceId) {
                selectedCam = camList[deviceIndex].deviceId;
            } else {
                selectedCam = camList && camList[0] ? camList[deviceIndex].deviceId : -1;
            }
        }
    }
    loaded = true;
}
function apply() {
    if (!loaded)
        setTimeout(() => {
            loaded = true;
            apply();
        });
    const modified = compare();
    console.log(`*** modified: ${modified}`);
    console.log(selectedAudio);
    console.log(selectedMic);
    if (!modified) {
        commonStore.setDeviceModifyState(false);
        checkParameter();
        return;
    }
    if (selectedCam == -1) {
        console.log("*** no cam selected set no cam !");
        callStore.setCameraNotAllowed(true);
    } else {
        callStore.setCameraNotAllowed(false);
    }
    const audioPrams = {
        type: 0,
        id: selectedAudio,
    };
    const micParams = {
        type: 1,
        id: selectedMic,
    };

    let camIndex = -1;
    if (camList && camList.length > 0) {
        camIndex = camList.findIndex((item) => {
            return item.deviceId === selectedCam;
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
    if (camList && camList.length > 0) {
        camIndex = camList.findIndex((item) => {
            return item.deviceId === selectedCam;
        });
    }
    if (
        selectedAudio === $store.state.selectedAudioID &&
        selectedMic === $store.state.selectedMicID &&
        camIndex === $store.state.selectedCamIndex
    ) {
        return false;
    } else {
        return true;
    }
}
function checkParameter() {
    if (propsData.type == "request") {
        // 1:1 통화를 걸 경우
        propsData.requestCall(propsData.deviceId);
    } else if (
        propsData.type == "openOwnMeeting" ||
        propsData.type == "openMeeting" ||
        propsData.type == "joinMeeting"
    ) {
        // 회의를 시작하거나 참여하는 경우
        propsData.func(propsData.type, propsData.seq);
    } else if (propsData.type == "directCall" || propsData.type == "acceptMeeting") {
        // 음성통화 참여 요청이 들어온 경우
        propsData.func(propsData.type);
    }
    close(1);
}
function disableCamSelect() {
    onlyVoiceId = true;
    selectedCam = -1;
    const element = document.getElementById("camInput");
    element.disabled = true;
}
</script>

<style lang="scss" scoped>
.mainWrap {
    display: flex;
    flex-direction: column;
    justify-items: center;
    align-items: center;
    width: 100%;
    height: 100%;
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
    }

    img {
        width: 142px;
        height: 73px;
        left: 30px;
    }
}
.divisionLine {
    width: 376px;
    height: 0px;
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
        }

        .applyBtn {
            width: 85px;
            height: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 20px;
        }
    }
}
</style>
