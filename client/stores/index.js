// stores/app.ts (or a more descriptive name like stores/meeting.ts)
// eslint-disable-next-line no-undef
import { useRouter } from 'nuxt/app';
import { defineStore } from 'pinia';
// import { axiosRequest } from "../plugins/axiosRequest"; // axiosRequest는 그대로 임포트

// 유틸리티 함수들 (원본 코드에서 가져옴)
function getTimeZone(standard) {
  const now = new Date(Number(standard) * 1000);
  const strDatetime =
    leadingZeros(now.getFullYear(), 4) +
    "." +
    leadingZeros(now.getMonth() + 1, 2) +
    "." +
    leadingZeros(now.getDate(), 2);
  return strDatetime;
}

function leadingZeros(n, digits) {
  let zero = "";
  n = n.toString();
  if (n.length < digits) {
    for (let i = 0; i < digits - n.length; i++) {
      zero += "0";
    }
  }
  return zero + n;
}

function getWorldTime() {
  const date = new Date();
  let x = date.getTimezoneOffset() / 60;
  x = x * 60 * 60 * 1000;
  const timestampUTC = (date.getTime() + x) / 1000;
  return Math.round(timestampUTC);
}

function newNoticeDateCompare(saveDate) {
  const noticeSaveDate = saveDate;
  const nowDate = getWorldTime();
  const dateLimit = 259200; // timestamp 3일
  const calcSaveDate = noticeSaveDate + dateLimit;
  if (calcSaveDate <= nowDate) {
    return false;
  } else {
    return true;
  }
}

// moduleA는 Vuex 모듈이었으나, Pinia에서는 별도의 스토어로 분리하거나,
// 간단한 전역 변수라면 그대로 유지할 수 있습니다.
// 여기서는 `userDevice`를 상태에 직접 통합하고, `moduleA`는 제거합니다.
// 만약 `moduleA`가 더 복잡한 로직을 가진다면 별도의 Pinia 스토어로 만드는 것이 좋습니다.
export const useCommonStore = defineStore("common", {
    state: () => ({
        contentsViewType: 0,
        callingLayoutType: 1,
        isAlarmIconChecked: false,
        fileSendStatus: 0,
        isShare: false,
        isDrawing: false,
        isSounded: false,
        isVideo: false,
        alertNum: 1,
        janus: {}, // Object 대신 빈 객체로 초기화
        sfutest: {}, // Object 대신 빈 객체로 초기화
        janusUse: false,
        userListStatus: [],
        defaultRoomNumberCount: 16, // default : 15 + Main
        roomNumberCount: 16,
        feedsLength: 0,
        videoLayoutChangeResult: false,
        alertStatus: "",
        noneOverlayAlertStatus: 0,
        fileModalFlag: false,
        callingUser: [],
        receiveFileResFlag: { flag: false, selectedUserName: "" }, // 수락/거절한 송신자 이름 저장
        fileReceiveUser: "",
        fileReceiver: "", // 송신자일 경우에만 사용하는 수신자의 deviceid
        fileSendFlag: false,
        hq_list: [],
        br_list: [],
        fileSendNickname: "",
        noticeList: [],
        newNoticeFlag: false, // 신규공지사항 flag
        // =>kyj
        sendFileData: {}, // Object 대신 빈 객체로 초기화
        // <=kyj
        cancelFileTransferFlag: false,
        existNotice: false, // 공지사항 존재하는지 체크
        noticeCheckboxStatus: false, // 공지사항 하루동안 보지 않기 체크박스의 상태
        accessDeviceCheck: "PC", // 접근 device 체크 (PC, Mobile)
        accessDeviceOS: "PC", // 접근 device OS (PC, android, iphone)
        connectionPathCheck: "Browser",
        isDrawingEnable: false, // 드로잉 활성화 상태
        previewModalInfo: { eachModalInfo: [], previewModalcnt: 0 }, // 수신창 미리보기
        onlyVoiceIdInterval: "",
        videoState: false,
        mainVideoIndex: "",
        mainVideoInfo: "",
        selectedAudioID: undefined,
        selectedMicID: undefined,
        selectedCamIndex: undefined,
        mediaDeviceModified: false,
        devicedSelection: false,
        powerManagerOpen: null,
    }),

    actions: {
        changeLayoutType(e) {
            if (this.accessDeviceCheck === "Mobile") {
                this.callingLayoutType = 5;
            } else {
                this.callingLayoutType = parseInt(e);
            }
        },
        changeViewType(e) {
            this.contentsViewType = e;
        },
        isAlarmIconChecked() {
            this.isAlarmIconChecked = !this.isAlarmIconChecked;
        },
        fileSend(e) {
            // 이 fileSend는 `state.fileSend`에 할당하려는 것 같으나, `state`에 `fileSend`가 없음. `fileSendStatus`와 겹쳐서 `fileSend`는 제거하거나 명확히 사용해야 함. 여기서는 `fileSendStatus`와 분리하여 처리
            // 이 부분은 state에 `fileSend`라는 속성이 없으므로, 의도에 따라 수정하거나 제거해야 합니다.
            // 일단 기존 코드를 최대한 유지하기 위해 주석 처리합니다.
            // this.fileSend = e;
        },
        fileSendStatus(e) {
            this.fileSendStatus = e;
        },
        isShare() {
            this.isShare = !this.isShare;
        },
        setIsDrawing(payload) {
            this.isDrawing = payload;
        },
        isSounded() {
            this.isSounded = !this.isSounded;
        },
        setIsSoundedTrue() {
            this.isSounded = true;
        },
        setIsSoundedFalse() {
            this.isSounded = false;
        },
        isVideo() {
            this.isVideo = !this.isVideo;
        },
        setIsVideoTrue() {
            this.isVideo = true;
        },
        setIsVideoFalse() {
            this.isVideo = false;
        },
        alert(payload) {
            this.alertNum = payload;
        },
        setAlert(payload) {
            this.alertNum = payload;
            const modalStore = useModalStore();
            modalStore.openModal("call");
        },
        // `userList`라는 state 속성이 정의되어 있지 않습니다.
        // 만약 `userListStatus`를 의미한다면 해당 속성으로 변경해야 합니다.
        // 현재 코드에서는 `userListStatus`를 사용하는 것으로 가정하고 수정합니다.
        setClick(payload) {
            if (this.userListStatus[payload]) {
                this.userListStatus[payload].isClicked =
                    !this.userListStatus[payload].isClicked;
            }
        },
        setSounded(payload) {
            if (this.userListStatus[payload]) {
                this.userListStatus[payload].isSounded =
                    !this.userListStatus[payload].isSounded;
            }
        },
        // Janus Function Start
        setJanus(payload) {
            this.janus = payload.janus;
            this.janusUse = payload.janusUse;
        },
        setUserList(payload) {
            // console.log("*** vuex: setUserList")
            // console.log(payload)
            // console.log(
            //   "*** vuex: setUserList payload.index = " +
            //        payload.index +
            //       " payload.status =  " +
            //       payload.status
            // )
            // userList 대신 userListStatus 사용
            if (this.userListStatus[payload.index]) {
                this.userListStatus[payload.index] = payload.status;
            }
        },
        setSfutest(payload) {
            this.sfutest = payload;
            // console.log("*** vuex: setSfutest")
            // console.log(payload)
        },
        setUserListStatus(payload) {
            // console.log("*** vuex: setUserListStatus", payload)
            if (!this.userListStatus[payload.col]) {
                // 해당 인덱스가 없으면 초기화 (빈 객체로)
                this.userListStatus[payload.col] = {};
            }
            this.userListStatus[payload.col].text = payload.text;
            this.userListStatus[payload.col].status = payload.status;
            this.userListStatus[payload.col].userListIndex = payload.col;
            this.userListStatus[payload.col].nickname = payload.nickname;
        },
        setUserOne(payload) {
            if (payload.index) {
                // 해당 인덱스가 없으면 초기화 (빈 객체로)
                this.userListStatus[payload.index] = payload.newObj;
            }
        },
        // 파일 송신자 채팅 index 관련 정보저장
        setFileSendInfo(payload) {
            if (payload.fileSendInfo && Object.keys(payload.fileSendInfo).length !== 0) {
                if (this.userListStatus[payload.index]) {
                    this.userListStatus[payload.index].fileSendInfo =
                        payload.fileSendInfo;
                }
            }
        },
        // 수신자 측에서 파일 송신자 관련된 파일 정보저장
        setFileReceiveInfo(payload) {
            // 파일 송신자, 파일수신채팅 Index 관리
            if (
                payload.fileReceiveInfo &&
                Object.keys(payload.fileReceiveInfo).length !== 0
            ) {
                if (this.userListStatus[payload.index]) {
                    this.userListStatus[payload.index].fileReceiveInfo =
                        payload.fileReceiveInfo;
                }
            }
        },
        setMainVideoStatus(payload) {
            if (this.userListStatus[this.roomNumberCount - 1]) {
                this.userListStatus[this.roomNumberCount - 1].type = payload.type;
                this.userListStatus[this.roomNumberCount - 1].text = payload.text;
                this.userListStatus[this.roomNumberCount - 1].nickname = payload.nickname;
            }
        },
        setUserNickname(payload) {
            if (this.userListStatus[payload.index]) {
                this.userListStatus[payload.index].nickname = payload.nickname;
            }
        },
        setRoomNumberCount(payload) {
            this.roomNumberCount = payload;
        },
        setFeedsNumberCount(payload) {
            this.feedsLength = payload;
        },
        makeUserListStatus() {
            this.userListStatus = [];
            const stateList = {}; // new Object() 대신 {} 사용
            for (let i = 0; i < this.roomNumberCount; i++) {
                if (i === 0) {
                    stateList.text = sessionStorage.getItem("m_nickname");
                    stateList.status = "none";
                    stateList.mute = false;
                    stateList.motionFall = false;
                    stateList.motionNoMove = false;
                    stateList.zoomLevel = 1;
                    stateList.rate = 0;
                    stateList.nickname = sessionStorage.getItem("m_nickname");
                } else if (i === this.roomNumberCount - 1) {
                    stateList.text = "";
                    stateList.type = "";
                    stateList.status = "main";
                    stateList.zoomLevel = 1;
                    stateList.rate = 0;
                    stateList.nickname = "";
                } else {
                    stateList.text = "";
                    stateList.status = "none";
                    stateList.mute = false;
                    stateList.motionFall = false;
                    stateList.motionNoMove = false;
                    stateList.zoomLevel = 1;
                    stateList.rate = 0;
                    stateList.nickname = "";
                }
                // JSON.stringify/parse 대신 객체 복사 (spread operator나 Object.assign) 사용
                this.userListStatus.push({ ...stateList });
            }
            console.log(this.userListStatus);
            // console.log("*** vuex: makeUserListStatus")
        },
        addUserListStatus(payload) {
            // 추가할 데이터 설정
            const stateList = {}; // new Object() 대신 {} 사용
            stateList.text = "";
            stateList.status = "none";
            stateList.mute = false;
            stateList.motionFall = false;
            stateList.motionNoMove = false;
            stateList.zoomLevel = 1;
            stateList.rate = 0;
            stateList.nickname = "";
            stateList.hostIcon = false;

            // 마지막 것 제거
            const mainUserList = this.userListStatus.pop();

            // 신규 추가
            this.userListStatus.push({ ...stateList });

            // 마지막 것 다시 추가
            this.userListStatus.push(mainUserList);
            // console.log("*** vuex: addUserListStatus")
        },
        setVideoLayoutChangeResult(payload) {
            this.videoLayoutChangeResult = payload;
        },
        setHostIcon(payload) {
            // Vue 3에서는 `Vue.set`이 필요 없이 직접 할당 가능
            if (this.userListStatus[payload.index]) {
                this.userListStatus[payload.index].hostIcon = payload.hostIcon;
            }
        },
        // 공통 modal status Vuex
        setAlertStatus(payload) {
            this.alertStatus = payload;
        },
        setNoneOverlayAlertStatus(payload) {
            this.noneOverlayAlertStatus = payload;
            const modalStore = useModalStore();
            modalStore.openModal("noneOverlayModal");
        },
        // 메인화면 줌 레벨 변경
        setMainScreenZoomLevel(payload) {
            if (this.userListStatus[payload.index]) {
                this.userListStatus[payload.index].mute = payload.mute; // 이 뮤테이션 이름과 동작이 다소 어색함 (ZoomLevel인데 Mute를 변경)
            }
        },
        // 파일 수신 (이름과 다르게 MicMute를 변경)
        setUserListMicMute(payload) {
            if (this.userListStatus[payload.index]) {
                this.userListStatus[payload.index].mute = payload.mute;
            }
        },
        // 사용자 줌레벨 설정
        setUserListZoomLevel(payload) {
            if (this.userListStatus[payload.index]) {
                this.userListStatus[payload.index].zoomLevel = payload.zoomLevel;
            }
        },
        // 파일 미리보기 모달창 생성
        setPreviewModalFlag(payload) {
            if (payload.show === "show") {
                this.previewModalInfo.eachModalInfo.push({
                    index: payload.modalIndex,
                    url: payload.url,
                    state: payload.show,
                });
                this.previewModalInfo.previewModalcnt++;
            }
        },
        // 파일 모달창 open 여부
        setFileModalFlag(payload) {
            this.fileModalFlag = payload;
        },
        // 파일 모달창 사용자 push
        setCallingUser(payload) {
            if (payload === "init") {
                this.callingUser = [];
            } else {
                const obj = {};
                obj.nickname = payload[0];
                obj.deviceid = payload[1];
                this.callingUser.push(obj);
            }
        },
        // 파일 수신/거절 클릭 시 송신자 이름 저장
        setReceiveFileResFlag(payload) {
            this.receiveFileResFlag.flag = payload.flag;
            this.receiveFileResFlag.selectedUserName = payload.selectedUserName;
        },
        // 파일 사용자 저장
        setFileReceiver(payload) {
            this.fileReceiver = payload;
        },
        // 파일 송수신 버튼 클릭 시
        setFileSendFlag(payload) {
            this.fileSendFlag = payload;
        },
        // =>kyj
        // 보내는 파일 데이터 저장
        setSendFileData(payload) {
            this.sendFileData = payload;
        },
        // 각 사용자의 파일 수신율
        setFileReceptionRate(payload) {
            // console.log(payload)
            // console.log(this.userListStatus)
            if (this.userListStatus[payload.index]) {
                this.userListStatus[payload.index].rate = payload.rate;
            }
        },
        // <=kyj
        // 조직도 hq 생성
        setHq_list(payload) {
            this.hq_list = payload;
        },
        // 조직도 br 생성
        setBr_list(payload) {
            this.br_list = payload;
        },
        // 파일 보내는 사람 이름 저장
        setFileSendNickname(payload) {
            // 초기화
            this.fileSendNickname = "";
            this.fileSendNickname = payload;
        },
        setNoticeList(payload) {
            // console.log("*** vuex: setNoticeList")
            if (payload === "init") {
                this.noticeList = [];
            } else {
                this.noticeList.push(payload);

                // 신규 공지사항 있는지 체크 -> 아이콘 표시 하기 위해
                for (let i = 0; i < this.noticeList.length; i++) {
                    if (this.noticeList[i].newNotice) {
                        this.newNoticeFlag = this.noticeList[i].newNotice;
                        break;
                    }
                }
            }
        },
        // 공지사항이 존재하는지 확인
        setExistNotice(payload) {
            this.existNotice = payload;
        },
        setCancelFileTransferFlag(payload) {
            this.cancelFileTransferFlag = payload;
        },
        // 공지사항 체크박스 상태
        setNoticeCheckboxStatus(payload) {
            this.noticeCheckboxStatus = payload;
        },
        // 접근하는 디바이스 체크
        setAccessDeviceCheck(payload) {
            this.accessDeviceCheck = payload;
            // moduleA.userDevice = payload; // moduleA 제거 가정
        },
        setAccessDeviceOS(payload) {
            this.accessDeviceOS = payload;
        },
        /* 서브 비디오 모션 감지 아이콘 */
        setUserListMotionFall(payload) {
            if (this.userListStatus[payload.index]) {
                this.userListStatus[payload.index].motionFall = payload.result;
            }
        },
        /* 서브 비디오 움직임 없음 감지 아이콘 */
        setUserListNoMove(payload) {
            if (this.userListStatus[payload.index]) {
                this.userListStatus[payload.index].motionNoMove = payload.result;
            }
        },
        setConnectionPathCheck(payload) {
            this.connectionPathCheck = payload;
        },
        isDrawingEnable(payload) {
            this.isDrawingEnable = payload.result;
        },
        setOnlyVoiceIdInterval(payload) {
            if (payload === true) {
                this.onlyVoiceIdInterval = setInterval(() => {
                    navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    this.isVideo = false;
                    setTimeout(() => {
                        this.isVideo = true;
                    }, 50);
                }, 100);
                setTimeout(() => {
                    clearInterval(this.onlyVoiceIdInterval); // clearTimeout 대신 clearInterval
                }, 20000);
            } else {
                if (this.onlyVoiceIdInterval) {
                    clearInterval(this.onlyVoiceIdInterval); // clearTimeout 대신 clearInterval
                    this.onlyVoiceIdInterval = "";
                }
            }
            return true;
        },
        setVideoState(payload) {
            this.videoState = payload;
        },
        setMainVideoIndex(payload) {
            this.mainVideoIndex = payload;
        },
        setMainVideoInfo(payload) {
            this.mainVideoInfo = payload;
        },
        setMediaDevices(payload) {
            if (payload.type === 0) {
                console.log(
                    `*** media device mutated type: ${payload.type}, id: ${payload.id}`,
                );
                this.selectedAudioID = payload.id;
                window.localStorage.setItem("selectedAudioID", payload.id);
            } else if (payload.type === 1) {
                console.log(
                    `*** media device mutated type: ${payload.type}, id: ${payload.id}`,
                );
                this.selectedMicID = payload.id;
                window.localStorage.setItem("selectedMicID", payload.id);
            } else if (payload.type === 2) {
                console.log(
                    `*** media device mutated type: ${payload.type}, id: ${payload.index}`,
                );
                this.selectedCamIndex = payload.index;
                window.localStorage.setItem("selectedCamIndex", payload.index);
            }
        },
        setDeviceModifyState(payload) {
            this.mediaDeviceModified = payload;
        },
        setShowDeviceModal(payload) {
            this.devicedSelection = payload;
        },
        setPowermanagerOpen(payload) {
            this.powerManagerOpen = payload;
        },

        // Vuex actions는 Pinia actions 내부에 비동기 로직으로 직접 구현됩니다.
        async getNoticeList(payload) {
            // // context 인자 제거
            // const jwtToken = sessionStorage.getItem("jwt");
            // const url = process.env.noticeList;
            // // axiosRequest 플러그인 사용 (Nuxt 2의 $axios를 직접 사용하는 대신)
            // const params = {
            //     data: {
            //         en_seq: payload,
            //     },
            //     api: url,
            //     headers: {
            //         jwt: jwtToken, // 직접 headers에 jwt를 포함
            //     },
            // };
            // try {
            //     const json = await axiosRequest("post", params); // await 사용
            //     // console.log("*** Pinia: axios getNoticeList Success");
            //     if (json.status === 200) {
            //         // 0 보다 클 경우 공지사항을 show 한다.
            //         if (json.data.length > 0) {
            //             this.setExistNotice(true); // 직접 액션 호출
            //         }
            //         this.setNoticeList("init"); // 먼저 기존 공지사항 목록 초기화
            //         for (let i = 0; i < json.data.length; i++) {
            //             const noticeListEntry = {}; // 매번 새로운 객체 생성
            //             const noticeTitle = json.data[i].content; // 원본 주석 처리된 로직 제거
            //             // Pinia actions는 직접 상태를 변경합니다.
            //             noticeListEntry.text = noticeTitle;
            //             noticeListEntry.detail = json.data[i].content;
            //             noticeListEntry.date = getTimeZone(json.data[i].save_time);
            //             noticeListEntry.newNotice = newNoticeDateCompare(
            //                 json.data[i].save_time,
            //             );
            //             this.setNoticeList(noticeListEntry); // 직접 액션 호출
            //         }
            //     }
            // } catch (error) {
            //     // console.log("*** Pinia: getNoticeList Fail");
            //     this.setNoticeList("init"); // 직접 액션 호출
            //     console.error(error); // console.log 대신 console.error
            // }
        },
    },
});