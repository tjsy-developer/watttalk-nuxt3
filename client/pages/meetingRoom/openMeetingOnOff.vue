<template>
    <div class="beforeMeetingMainPage" id="beforeMeetingMainPage">
        <div id="loadingOverlay"></div>
        <div v-if="startStatus == 0" class="beforeMeeting">
            <div class="textContainer">
                <img src="@/assets/images/conference/ic_attention.png" />
                <p class="onOffboldWhite">{{ $t("preOpeningMeeting2") }}</p>
                <p class="onOffWhite">{{ $t("reEnter") }}</p>
                <div class="onOffBtnSet">
                    <button class="onOffContentBtn1" @click="openMeetingContent">
                        {{ $t("meetingContent") }}
                    </button>
                    <button class="onOffRefreshBtn" @click="refreshPage">
                        {{ $t("refresh") }}
                    </button>
                </div>
            </div>

            <transition name="slide" mode="out-in">
                <div v-show="meetingOnOff == true" class="onOffMeeting">
                    <span class="onOffMeetingTitle">{{ $t("meetingSchedule") }}</span>
                    <table>
                        <tbody v-if="type == 0 || type == 1">
                            <tr>
                                <td>
                                    {{ $t("meetingTitle") }}
                                </td>
                                <td>
                                    {{ subject }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("meetingDate") }}
                                </td>
                                <td>
                                    {{ startDate }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("startTime") }}
                                </td>
                                <td>
                                    {{ startTime }}
                                </td>
                                <td>
                                    {{ $t("endTime") }}
                                </td>
                                <td>
                                    {{ endTime }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("meetingMember") }}
                                </td>
                                <td>
                                    {{ members }}
                                </td>
                            </tr>
                        </tbody>
                        <tbody v-else-if="type == 2">
                            <tr>
                                <td>
                                    {{ $t("meetingTitle") }}
                                </td>
                                <td>
                                    {{ subject }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("startDate") }}
                                </td>
                                <td>
                                    {{ startDate2 }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("endDate") }}
                                </td>
                                <td>
                                    {{ endDate }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("meetingMember") }}
                                </td>
                                <td>
                                    {{ members }}
                                </td>
                            </tr>
                        </tbody>
                        <tbody v-else-if="type == 3">
                            <tr>
                                <td>
                                    {{ $t("meetingTitle") }}
                                </td>
                                <td>
                                    {{ subject }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("startDate") }}
                                </td>
                                <td>
                                    {{ startDate2 }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("endDate") }}
                                </td>
                                <td>
                                    {{ $t("untilDelete") }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("meetingMember") }}
                                </td>
                                <td>
                                    {{ members }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </transition>
            <div
                class="onOffLine"
                :style="{ marginTop: meetingOnOff == true ? '50px' : '0px' }"
            ></div>
            <video playsinline loop controls autoplay muted width="460" height="258">
                <source src="@/assets/video/wattVideo.mp4" />
            </video>
            <span class="onOffWattDomain">www.wattsolution.co.kr</span>
        </div>

        <div v-else-if="startStatus == 1" class="startMeeting">
            <div class="textContainer">
                <img src="@/assets/images/conference/ic_entry.png" />
                <p class="onOffboldWhite">{{ $t("openMeeting") }}</p>
                <p class="onOffWhite">{{ $t("pleaseEnter") }}</p>
                <div class="onOffBtnSet">
                    <button class="onOffContentBtn1" @click="openMeetingOnOff">
                        {{ $t("enter") }}
                    </button>
                    <button class="onOffContentBtn2" @click="openMeetingContent">
                        {{ $t("meetingContent") }}
                    </button>
                    <div v-if="useEnterprise == 'samsung'" class="personalAgreeBox">
                        <span>{{ $t("personal info agree") }}</span>
                        <span>{{ $t("personal info agree check") }}</span>
                        <input
                            type="checkbox"
                            v-model="consentStatus"
                            @change="consentStatusChecked"
                        />
                    </div>
                </div>
            </div>
            <transition name="slide" mode="out-in">
                <div v-show="meetingOnOff == true" class="onOffMeeting">
                    <span class="onOffMeetingTitle">{{ $t("meetingSchedule") }}</span>
                    <table>
                        <tbody v-if="type == 0 || type == 1">
                            <tr>
                                <td>
                                    {{ $t("meetingTitle") }}
                                </td>
                                <td>
                                    {{ subject }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("meetingDate") }}
                                </td>
                                <td>
                                    {{ startDate }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("startTime") }}
                                </td>
                                <td>
                                    {{ startTime }}
                                </td>
                                <td>
                                    {{ $t("endTime") }}
                                </td>
                                <td>
                                    {{ endTime }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("meetingMember") }}
                                </td>
                                <td>
                                    {{ members }}
                                </td>
                            </tr>
                        </tbody>
                        <tbody v-else-if="type == 2">
                            <tr>
                                <td>
                                    {{ $t("meetingTitle") }}
                                </td>
                                <td>
                                    {{ subject }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("startDate") }}
                                </td>
                                <td>
                                    {{ startDate2 }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("endDate") }}
                                </td>
                                <td>
                                    {{ endDate }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("meetingMember") }}
                                </td>
                                <td>
                                    {{ members }}
                                </td>
                            </tr>
                        </tbody>
                        <tbody v-else-if="type == 3">
                            <tr>
                                <td>
                                    {{ $t("meetingTitle") }}
                                </td>
                                <td>
                                    {{ subject }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("startDate") }}
                                </td>
                                <td>
                                    {{ startDate2 }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("endDate") }}
                                </td>
                                <td>
                                    {{ $t("untilDelete") }}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{ $t("meetingMember") }}
                                </td>
                                <td>
                                    {{ members }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </transition>
            <div
                class="onOffLine"
                :style="{ marginTop: meetingOnOff == true ? '50px' : '0px' }"
            ></div>
            <video playsinline loop controls autoplay muted width="460" height="258">
                <source src="@/assets/video/wattVideo.mp4" />
            </video>
            <span class="onOffWattDomain">www.wattsolution.co.kr</span>
        </div>

        <div v-else-if="startStatus == 2" class="endMeeting">
            <div class="textContainer">
                <img src="@/assets/images/conference/ic_end.png" />
                <p class="onOffboldWhite">{{ $t("endedMeeting") }}</p>
                <p class="onOffWhite">{{ $t("endValid") }}</p>
                <div class="onOffBtnSet"></div>
                <div
                    class="onOffLine"
                    :style="{ marginTop: meetingOnOff == true ? '50px' : '0px' }"
                ></div>
                <video playsinline loop controls autoplay muted width="460" height="258">
                    <source src="@/assets/video/wattVideo.mp4" />
                </video>
                <p class="onOffWattDomain">www.wattsolution.co.kr</p>
            </div>
        </div>

        <div v-else-if="startStatus == 3" class="endMeeting">
            <div class="textContainer">
                <img src="@/assets/images/conference/ic_end.png" />
                <p class="onOffboldWhite">{{ $t("deletedMeeting") }}</p>
                <p class="onOffWhite">{{ $t("endValid") }}</p>
                <div class="onOffBtnSet"></div>
                <div
                    class="onOffLine"
                    :style="{ marginTop: meetingOnOff == true ? '50px' : '0px' }"
                ></div>
                <video playsinline loop controls autoplay muted width="460" height="258">
                    <source src="@/assets/video/wattVideo.mp4" />
                </video>
                <p class="onOffWattDomain">www.wattsolution.co.kr</p>
            </div>
        </div>

        <div v-else-if="startStatus == 4" class="inputNickname">
            <div class="textContainer">
                <img src="@/assets/images/conference/ic_entry.png" />
                <p class="onOffboldWhite">사용하실 닉네임을 입력해주세요.</p>
                <p class="onOffWhite">특수문자는 사용할 수 없습니다.</p>
                <div class="onOffBtnSet row">
                    <div style="width: 100%">
                        <input
                            id="inputTextNickname"
                            v-model="customNickname"
                            class="inputTextNickname"
                            type="text"
                        />
                        <button class="nicknameCheckBtn" @click="customNicknameCheck">
                            확인
                        </button>
                    </div>
                    <div v-if="loginAlaramStatus == 1" style="width: 100%">
                        <p class="loginAlarmText">
                            이미 사용중인 닉네임입니다. 다른 닉네임을 입력해주세요.
                        </p>
                    </div>
                </div>
                <div
                    class="onOffLine"
                    :style="{ marginTop: meetingOnOff == true ? '50px' : '0px' }"
                ></div>
                <video playsinline loop controls autoplay muted width="460" height="258">
                    <source src="@/assets/video/wattVideo.mp4" />
                </video>
                <p class="onOffWattDomain">www.wattsolution.co.kr</p>
            </div>
        </div>

        <div
            v-if="useEnterprise == 'samsung'"
            class="personalModalBox col-6"
            :style="{
                width: mobileCheck == false && consentStatus == true ? '40%' : '100%',
                height: consentStatus == true ? '100%' : '',
            }"
        >
            <PersonalInfoModal v-if="consentStatus" :comp-data="consentStatus" />
        </div>
    </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, reactive } from "vue";
import { useLoginStore } from "@/stores/login";
import { useMeetingStore } from "@/stores/meeting";
import { useCallStore } from "@/stores/call";
import { useUserListStore } from "@/stores/userList";
import { useI18n } from "vue-i18n";
import { useSignallingSocket } from "@/composables/socket/useSignallingSocket";
import { useRoomStore } from "@/stores/room";
import { useModal } from "vue-final-modal";
import LoadingModal from "@/components/modal/LoadingModal.vue";
import useSocketEmitEvents from "@/composables/socket/useSocketEmit";
// State
const { t, locale, setLocale } = useI18n();
const meeting_reservation_uid = ref("");
const startStatus = ref(null);
const meetingOnOff = ref(false);
const subject = ref("");
const startDate = ref("");
const startDate2 = ref("");
const endDate = ref("");
const startTime = ref("");
const startTime2 = ref("");
const endTime = ref("");
const endTime2 = ref("");
const members = ref("");
const userListAllFlag = ref(false);
const nonMembersRegisterFlag = ref(false);
const consentStatus = ref(false);
const useEnterprise = ref(process.env.useEnterprise);
const saveUniqueRoomid = ref("");
const mobileCheck = ref(false);
const customNickname = ref("");
const nicknameCheckFlag = ref(false);
const loginAlaramStatus = ref(null);
const maskLoading = ref(true);
const type = ref(null);

// Store
const commonStore = useRoomStore();
const loginStore = useLoginStore();
const meetingStore = useMeetingStore();
const callStore = useCallStore();
const userListStore = useUserListStore();

// Sockets
const { signallingSocket, transferSocket } = useSignallingSocket();

// DOM References
const inputTextNickname = ref(null);
const openMeetingloader = ref(null);
const beforeMeetingMainPage = ref(null);
const loadingOverlay = ref(null);
const personalModalBox = ref(null);

// Computed properties using Pinia store
const accessDeviceCheck = computed(() => loginStore.accessDeviceCheck);
const { requestUserListAll } = useSocketEmitEvents();
const { open: loadingOpen, close: loadingClose } = useModal({
    component: LoadingModal,
    key: `loading-modal`,
    attrs: {
        maskLoadingType: "noneMemberSignup",
    },
});;

// Methods
const moveMeeting = () => {
    if (useEnterprise.value === "samsung") {
        if (!consentStatus.value) {
            alert(t("personal info Unconsent"));
            return false;
        } else {
            if (userListAllFlag.value) {
                joinMeeting(sessionStorage.getItem("m_roomid"));
            } else {
                alert(
                    t("사용자 목록을 불러오고 있습니다. \n잠시 후 입장을 클릭해주세요."),
                );
                return false;
            }
        }
    } else {
        if (userListAllFlag.value) {
            joinMeeting(sessionStorage.getItem("m_roomid"));
        } else {
            alert(t("사용자 목록을 불러오고 있습니다. \n잠시 후 입장을 클릭해주세요."));
            return false;
        }
    }
};

const isBrowserCheck = () => {
    const agent = window.navigator.userAgent.toLowerCase();
    const isChrome = agent.includes("chrome");
    const iphoneChrome = agent.includes("crios");
    const isEdge = agent.includes("edg");

    // Removed the alert logic for a cleaner conversion
    return true;
};

const openMeetingOnOff = () => {
    console.log("*** methods: openMeetingOnOff::");
    const urlParams = new URLSearchParams(window.location.search);
    const reservId = urlParams.get("reservId");
    meeting_reservation_uid.value = reservId;

    console.log("*** methods: openMeetingOnOff:: reservId = ", reservId);

    const obj = { meeting_reservation_uid: reservId };
    const json = JSON.stringify(obj);
    signallingSocket.emit("openMeetingOnOff", json);
    console.log("*** socket.emit: openMeetingOnOff Request: " + json);
};

const nonMembersRegister = (uid, roomnumber) => {
    console.log("*** methods: nonMembersRegister::");
    const obj = { meeting_reservation_uid: uid, roomnumber };
    const json = JSON.stringify(obj);
    signallingSocket.emit("nonMembersRegister", json);
    console.log("*** socket.emit: nonMembersRegister Request: " + json);
};

const joinMeeting = (roomid) => {
    console.log("*** methods: joinMeeting::");
    const meetingSeq = meetingStore.meetingSeq;
    const obj = {
        meeting_seq: meetingSeq,
        deviceid: sessionStorage.getItem("m_local_deviceid"),
        roomid,
    };
    const json = JSON.stringify(obj);
    if (!meetingSeq) return;
    signallingSocket.emit("joinMeeting", json);
    console.log("*** socket.emit: joinMeeting Request: " + json);
};

const userListAllRequest = (makerid, enSeq) => {
    const obj = {
        deviceid: makerid,
        en_seq: enSeq,
        language: sessionStorage.getItem("languageCode"),
    };
    const json = JSON.stringify(obj);
    signallingSocket.emit("userListAll", json);
    console.log("*** socket.emit: userListAll request:" + json);
};

const refreshPage = () => {
    location.reload();
};

const openMeetingContent = () => {
    meetingOnOff.value = !meetingOnOff.value;
};

const getMeetingInfo = () => {
    const obj = { meeting_reservation_uid: meeting_reservation_uid.value };
    const json = JSON.stringify(obj);
    signallingSocket.emit("meetingInfo", json);
    console.log("*** socket.emit: meetingInfo Request: " + json);
};

const consentStatusChecked = () => {
    if (!consentStatus.value && personalModalBox.value) {
        personalModalBox.value.style.display = "block";
    }
    if (window.innerWidth < 1023) {
        mobileCheck.value = true;
    } else {
        mobileCheck.value = false;
    }
};

const hideModal = (data) => {
    // console.log("!!!!!!!!!!")
};

const requestBroadCast = (enSeq, uniqueRoomid) => {
    const obj = {
        local_deviceid: sessionStorage.getItem("m_local_deviceid"),
        type: "room",
        unique_roomid: uniqueRoomid,
        en_seq: enSeq,
        eventName: "userListAll",
    };
    const json = JSON.stringify(obj);
    signallingSocket.emit("requestBroadCast", json);
    console.log("*** socket.emit: requestBroadCast Request: " + json);
};

const customNicknameCheck = async () => {
    if (customNickname.value === "") {
        alert("사용하실 닉네임을 입력해주세요.");
    } else {
        await nicknameRegularEx(customNickname.value);
        updateNickname(
            sessionStorage.getItem("en_seq"),
            sessionStorage.getItem("m_local_deviceid"),
            customNickname.value,
        );
        if (inputTextNickname.value) {
            inputTextNickname.value.disabled = true;
        }
    }
};

const nicknameRegularEx = (nickname) => {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line no-useless-escape
        const reg = /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
        if (reg.test(nickname)) {
            loginAlaramStatus.value = 0;
            customNickname.value = nickname.replace(reg, "");
        } else {
            customNickname.value = nickname;
        }
        resolve();
    });
};

const updateNickname = (enSeq, deviceid, nickname) => {
    const obj = { en_seq: enSeq, deviceid, nickname };
    const json = JSON.stringify(obj);
    signallingSocket.emit("updateNickname", json);
    console.log("*** socket.emit: updateNickname Request: " + json);
};

// Lifecycle Hooks
onMounted(() => {
    // Styles and i18n
    // require(`@/assets/styles/${sessionStorage.getItem("displayMode")}/components/meeting/openMeetingOnOff.sass`);
    setLocale("ko");

    console.log("*** mounted: openMeetingOnOff.vue 입니다.");

    // Access device check
    const filter = "win16|win32|win64|mac|linux";
    if (navigator.platform && !filter.includes(navigator.platform.toLowerCase())) {
        commonStore.setAccessDeviceCheck("Mobile");
        commonStore.changeLayoutType(5);

        const MobileDevice = navigator.userAgent.toLowerCase();
        if (MobileDevice.includes("android")) {
            commonStore.setAccessDeviceOS("android");
        } else if (
            MobileDevice.includes("iphone") ||
            MobileDevice.includes("ipad") ||
            MobileDevice.includes("ipod")
        ) {
            commonStore.setAccessDeviceOS("ios");
        }
    } else {
        commonStore.setAccessDeviceCheck("PC");
    }

    // Socket setup and logic
    if (isBrowserCheck()) {
        openMeetingOnOff();
    }

    signallingSocket.on("openMeetingOnOff", (response) => {
        console.log("*** socket.on: openMeetingOnOff res = ", response);
        const json = JSON.parse(response);
        console.log("*** socket.on: json = ", json);

        getMeetingInfo();

        if (json.start_status === 1 && !nicknameCheckFlag.value) {
            startStatus.value = 4;
            if (!nonMembersRegisterFlag.value) {
                saveUniqueRoomid.value = json.unique_roomid;
                nonMembersRegister(meeting_reservation_uid.value, json.roomid);
            }
            return;
        }

        startStatus.value = json.start_status;
        if (json.start_status === 0) {
            console.log("*** socket.on: 회의실 개설 전입니다.");
        } else if (json.start_status === 1) {
            console.log("*** socket.on: 회의실이 개설 되었습니다.");
            if (!nonMembersRegisterFlag.value) {
                saveUniqueRoomid.value = json.unique_roomid;
                nonMembersRegister(meeting_reservation_uid.value, json.roomid);
            } else {
                callStore.setUniqueRoomid(json.unique_roomid);
                moveMeeting();
            }
        } else if (json.start_status === 2) {
            console.log("*** socket.on: 해당 회의는 종료 되었습니다.");
        }
    });

    signallingSocket.on("meetingInfo", (response) => {
        console.log("*** socket.on: meetingInfo res = ", response);
        const json = JSON.parse(response);
        subject.value = json.subject;

        const startTimeStamp = new Date(json.start_time * 1000);
        const endTimeStamp = new Date(json.end_time * 1000);

        const formatTime = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            return {
                date: `${year}-${month}-${day}`,
                time: `${hours}:${minutes}`,
                ampm: date.getHours() < 12 ? t("meetingAm") : t("meetingPm"),
            };
        };

        const startInfo = formatTime(startTimeStamp);
        const endInfo = formatTime(endTimeStamp);

        startDate.value = startInfo.date;
        startTime.value = startInfo.time;
        endTime.value = endInfo.time;
        startDate2.value = `${startInfo.date} ${startInfo.ampm} ${startInfo.time}`;
        endDate.value = `${endInfo.date} ${endInfo.ampm} ${endInfo.time}`;
        members.value = json.members;
        type.value = json.type;
    });

    signallingSocket.on("nonMembersRegister", (response) => {
        console.log("*** socket.on: nonMembersRegister res = ", response);
        const json = JSON.parse(response);

        if (json.status === 0) {
            alert("이미 영상통화에 입장한 사용자입니다.");
            window.location.href = "https://wattsolution.co.kr/";
        } else {
            sessionStorage.setItem("en_seq", json.en_seq);
            sessionStorage.setItem("hq_seq", json.hq_seq);
            sessionStorage.setItem("br_seq", json.br_seq);
            sessionStorage.setItem("m_local_deviceid", json.deviceid);
            sessionStorage.setItem("languageCode", "ko");
            sessionStorage.setItem("m_nickname", json.device_name);
            sessionStorage.setItem("m_roomid", json.roomnumber);

            meetingStore.setMeetingSeq(json.meeting_seq);
            loginStore.setLoginInfo({
                institution: '',
                headquarters: '',
                branch: '',
                nickname: json.nickname,
            });
            loginStore.setTokenInfo({
                auth: 0,
                id: json.deviceid,
                device_type: json.deviceid,
                en_seq: json.en_seq,
                hq_seq: json.hq_seq,
                br_seq: json.br_seq,
                m_local_deviceid: json.deviceid,
                sessionEmail: json.deviceid,

            })
            requestUserListAll(json.deviceid, json.en_seq)
            nonMembersRegisterFlag.value = true;
            nicknameRegularEx(json.device_name);
        }
    });

    signallingSocket.on("userListAll", (response) => {
        if (response) {
            const json = JSON.parse(response);
            console.log("왜 안들어와", json.users);
            userListStore.init();
            userListAdd(json.users);
            callStore.setUserData([]);
            callStore.setUserDataAll([]);
            const sortOrgList = json.users.sort((a, b) => b.status - a.status);
            callStore.setUserData(sortOrgList);
            callStore.setUserDataAll(json.users);
            const result = buildTree(sortOrgList);
            userListStore.setOrganizationList(result);
            userListAllFlag.value = true;
        }
    });

    signallingSocket.on("joinMeeting", (response) => {
        console.log("*** socket.on: joinMeeting res = ", response);
        const json = JSON.parse(response);

        sessionStorage.setItem("m_roomid", json.roomid);
        sessionStorage.setItem("createRoomFlag", "false");
        sessionStorage.setItem("inRoomFlag", "true");

        if (json.roomNumberCount) {
            commonStore.setRoomNumberCount(json.roomNumberCount);
        }

        commonStore.makeUserListStatus();
        callStore.setCallingType("joinGuestCall");

        setTimeout(() => {
            commonStore.setChangeViewType(2);
            navigateTo("/call");
        }, 1000);
    });

    signallingSocket.on("updateNickname", (response) => {
        console.log("*** socket.on: updateNickname res = ", response);
        const json = JSON.parse(response);

        if (json.result === 0) {
            loginAlaramStatus.value = 1;
            if (inputTextNickname.value) {
                inputTextNickname.value.focus();
            }
        } else {
            requestBroadCast(sessionStorage.getItem("en_seq"), saveUniqueRoomid.value);
            sessionStorage.setItem("m_nickname", customNickname.value);
            getMeetingInfo();

            if (
                openMeetingloader.value &&
                beforeMeetingMainPage.value &&
                loadingOverlay.value
            ) {
                openMeetingloader.value.classList.add("openMeetingloader");
                beforeMeetingMainPage.value.style.pointerEvents = "none";
                loadingOverlay.value.classList.add("maskOverlay");
            }
            loadingOpen()

            setTimeout(() => {
                if (
                    openMeetingloader.value &&
                    beforeMeetingMainPage.value &&
                    loadingOverlay.value
                ) {
                    openMeetingloader.value.classList.remove("openMeetingloader");
                    loadingOverlay.value.classList.remove("maskOverlay");
                    beforeMeetingMainPage.value.style.pointerEvents = "auto";
                }
                loadingClose();
                startStatus.value = 1;
                nicknameCheckFlag.value = true;
            }, 2000);
        }
        if (inputTextNickname.value) {
            inputTextNickname.value.disabled = false;
        }
    });
});

onBeforeUnmount(() => {
    console.log("*** onBeforeUnmount: socket Event Remove !!");
    signallingSocket.off("openMeetingOnOff");
    signallingSocket.off("nonMembersRegister");
    signallingSocket.off("joinMeeting");
    signallingSocket.off("meetingInfo");
    signallingSocket.off("updateNickname");
});
</script>

<style lang="scss">
// Variables
$color-white: #ffffff;
$color-blue: #2386d2;
$color-dark-gray: #393939;
$color-black: #000000;
$color-light-gray-1: #f3f3f3;
$color-light-gray-2: #e9e9e9;
$color-dark-text: #2a2a2a;
$color-light-text: #454545;
$color-light-text-2: #fff;
$color-border: #fafafa;
$color-red: #dc3545;

$font-nanum-square: "NanumSquare", sans-serif;
$font-noto-sans: "Noto Sans CJK KR", sans-serif;

// Mixins
@mixin button-styles {
    font: normal normal bold 14px/16px $font-nanum-square;
    color: $color-white;
    border-radius: 7px;
    height: 24px;
    cursor: pointer;
    border: none;
}

@mixin text-responsive($font-size-lg, $font-size-md, $font-size-sm) {
    font-size: $font-size-lg;
    @media all and (max-height: 767px) {
        font-size: $font-size-md;
    }
    @media all and (max-width: 479px) {
        font-size: $font-size-sm;
    }
}

// Styles
.beforeMeetingMainPage,
.beforeMeeting,
.startMeeting,
.endMeeting,
.inputNickname {
    width: 100%;
    height: 100%;
}

.onOffBtnSet {
    margin-top: 34px;
    margin-bottom: 66px;

    @media all and (max-height: 767px) {
        margin-top: 30px;
        margin-bottom: 20px;
    }
}

.onOffContentBtn1 {
    @include button-styles;
    width: 80px;
    background: $color-blue 0% 0% no-repeat padding-box;
    margin-right: 22px;
}

.onOffContentBtn2 {
    @include button-styles;
    width: 80px;
    background: $color-blue 0% 0% no-repeat padding-box;
}

.onOffRefreshBtn {
    @include button-styles;
    width: 80px;
    border: 1px solid $color-white;
    background: transparent;
}

.onOffLine {
    max-width: 480px;
    width: 90%;
    height: 2px;
    background: #8d8c8c 0% 0% no-repeat padding-box;
    border: 1px solid $color-dark-gray;
    border-radius: 1px;
    margin: 0 auto 52px auto;
}

.onOffWattDomain {
    margin-top: 19px;
    color: $color-white;
    font: normal normal normal 14px/40px $font-nanum-square;

    @media all and (max-width: 479px) {
        display: none;
    }
}

.onOffMeeting {
    width: 90%;
    height: 224px;
    max-width: 525px;
    background: $color-white 0% 0% no-repeat padding-box;
    box-shadow: 0px 0px 5px rgba($color-black, 0.16);
    border-radius: 16px;

    @media all and (max-height: 767px) {
        height: 180px;
    }

    @media all and (max-width: 479px) {
        width: 315px !important;
    }

    .onOffMeetingTitle {
        width: 100%;
        margin-left: 29px;
        margin-top: 38px;
        font: normal normal bold 15px/22px $font-noto-sans;

        @media all and (max-height: 767px) {
            margin-top: 15px;
        }
    }
}

.slide-enter-active {
    transition-duration: 5s;
    transition-timing-function: ease-in;
}

.slide-leave-active {
    transition-duration: 5s;
    transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
}

.slide-enter-to,
.slide-leave {
    max-height: 224px;
    overflow: hidden;
}

.slide-enter,
.slide-leave-to {
    overflow: hidden;
    max-height: 0;
}

.personalAgreeBox {
    margin-top: 10px;
    margin-bottom: 15px;
    align-items: center;
    display: flex;
    justify-content: center;

    > span {
        color: $color-white;
        font-size: 14px;

        &:nth-child(2) {
            margin-left: 5px;
        }
    }

    > input {
        margin-left: 5px;
    }
}

table {
    max-width: 465px;
    margin-left: 5%;
    margin-top: 10px;
    width: 90%;
    height: 112px;
    border-spacing: 1px;
}

.inputTextNickname {
    background-color: #f1f1f1;
    border: 1px solid #aaa;
    width: 250px;
    height: 35px;
    border-radius: 5px;
    padding-left: 20px;
}

.nicknameCheckBtn {
    @include button-styles;
    width: 80px;
    height: 35px;
    background: $color-blue 0% 0% no-repeat padding-box;
    margin-left: 15px;
}

.loginAlarmText {
    color: $color-white;
    top: 12px;
    position: relative;
    float: none;
    text-align: center;
    font-size: 16px;
}

.openMeetingloader {
    border: 16px solid $color-light-gray-1;
    border-radius: 50%;
    border-top: 16px solid #3498db;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.openMeetingloaderWrap {
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 11;
}

.maskLoading {
    position: relative;
    font-size: 20px;
    top: 10px;
    z-index: 11;
    color: $color-white;
}

.maskOverlay {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba($color-black, 0.6);
    backdrop-filter: blur(1.5px);
    -webkit-backdrop-filter: blur(1.5px);
    z-index: 10;
}

.textContainer {
    color: #fff;
    text-align: center;
    > p {
        margin: 0;
        &.onOffboldWhite {
            font-weight: 700;
        }
    }
}

.beforeMeetingMainPage,
.beforeMeeting,
.startMeeting,
.endMeeting,
.inputNickname {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
</style>
