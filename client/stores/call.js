// stores/calling.ts
import { defineStore } from 'pinia';

export const useCallStore = defineStore("call", {
    state: () => ({
        // State (상태)
        callingPopupInstitution: "",
        callingPopupHeadquarters: "",
        callingPopupBranch: "",
        callingPopupNickname: "",
        callingPopupResult: "",
        multiCallingResult: "",
        cancelCallResult: "",
        cancelCallFlag: "",
        groupCallCancelFlag: "",
        videoMainIndex: 0,
        errorCloseResult: "",
        mainVideoImage: "",
        mainVideoText: "",
        videoTagArray: [],
        videoStreamArray: [],
        inviteCancelFlag: "",
        contectListinCalling: false,
        userData: [],
        userDataAll: [],
        recentData: [],
        recentDataAll: [],
        inCallingFunction: "",
        inCallingFunctionParams: [],
        isContactListShow: false,
        hostChangeRequest: false,
        hostRequestStatus: "",
        hostRequestResult: "",
        hostRequestNickname: "",
        hostRequestInfo: "",
        hostCancelFlag: false,
        allMicMuteStatus: 1,
        allMicMuteFlag: false,
        micOnOffFlag: false,
        callingWindowCount: 0,
        micOnOffClick: false,
        forceMicMuteIndex: "", // 호스트가 마이크 mute 버튼을 클릭한 videoRemote Index
        forceMicMuteBtnClick: false,
        drawingIframe: false, // 드로잉 클릭 시
        forceLeaveIndex: "", // 호스트가 강제퇴장 버튼을 클릭한 videoRemote Index
        forceLeaveBtnClick: false,
        forceLeaveClickResult: false,
        TransmissionRate: 0,
        ReceptionRate: 0,
        callingType: "",
        myVideoStatus: "",
        forceMicOnOffFlag: false, // 호스트가 사용자에게 강제로 마이크를 off 했는지
        hangupCallingConfirmFlag: false, // 통화종료 팝업 창 Flag
        underStatus: 0, // calling Layout 4 하단 버튼 변경
        uploadPdfFile: "", // pdf file
        pdfCurrentPageNum: 1,
        pdfTotalPageNum: 0,
        canvas: null,
        receiverImagePath: "", // 수신 받은 이미지 path
        receiverImageDrawingMoveFlag: false, // 이미지를 수신 받고 드로잉으로 이동할 때 flag
        callingTimer: "", // 타이머
        antennaStep: 0, // 안테나 단계
        calcBitrate: 0,
        calcFrame: 0,
        calcResolution: 0,
        antennaStatus: false, // 안테나 표시 여부
        drawingGetFileChangeFlag: false, // 드로잉 이미지 업로드 시작 flag
        drawingGetFileObject: {}, // 드로잉 업로드 이미지 객체 (Object로 초기화)
        drawingGetFileSrc: "", // 드로잉 업로드 이미지 경로
        drawingGetPDFUploadFlag: false, // 드로잉 pdf 업로드 시작 flag
        drawingGetPDFUploadObject: {}, // 드로잉 업로드 pdf 객체 (Object로 초기화)
        drawingGetPDFUploadSrc: "", // 드로잉 업로드 pdf 경로
        pdfUploadProgrss: 0, // 드로잉 pdf 서버 업로드 진행률
        pdfUploading: false, // pdf 업로드 중임을 저장한다. -> 호스트 변경 시 이것이 true일 경우 막음.
        pdfUploadQueArray: [], // pdf 업로드 Que array
        PDFcancelUploadFlag: false, // pdf 업로드 cancelFlag
        mainVideoFullScreen: false, // 메인 비디오 풀 스크린 변경 flag
        mainVideoFullScreenText: false, // 메인 비디오 풀 스크린 변경 유도 텍스트 박스
        uniqueRoomid: "", // uniqueRoomid 추가 - 2021-07-21
        laserPointerLaction: [], // laserPointer Lowcation array
        laserPointerFlag: false, // flag 변경 시 calling에서 반응
        laserPointerShow: false, // flag 변경 시 레이저 표시
        isCapture: false, // 메인화면 캡쳐
        captureSaveFlag: false, // 캡쳐 저장 버튼 클릭 여부 -> 이것 변경 시 calling에서 반응
        captureImageInfo: {}, // 캡쳐 이미지 저장 객체 (Object로 초기화)
        globalVideoSend: false, // 카메라 장치 존재하는지 체크 (존재하면 true)
        globalAudioSend: false, // 마이크 장치 존재하는지 체크 (존재하면 true)
        drawingMoveToScreen: false, // 드로잉 -> 화면 공유 이동 시 true
        screenMoveToDrawing: false, // 화면공유 -> 드로잉 이동 시 true
        HQCaptureShow: false, // 고화질 캡쳐 버튼
        HQCaptureFlag: false, // 고화질 캡쳐 버튼 클릭 시 true -> calling에서 반응
        autoCallAcceptTime: 0, // 전화 자동 수락 시간초
        autoPictureAccept: false, // 사진 자동 수락 Flag
        autoDiscalling: false, // 자동 통화 종료
        autoDiscallingCancel: false, // 자동 통화 종료 취소 클릭 시 true
        autoDiscallingResult: false, // 자동 통화 종료 진행 여부 (자동통화 진행: true, 자동통화 진행X: false)
        motionFallInfo: [], // 모션 낙하 정보 배열
        motionFallFlag: false, // 모션 낙하 표시 Flag
        motionFallCloseBtnClick: false, // 모션 낙하 확인 버튼 클릭 Flag
        motionFallClickIndex: null, // 모션 낙하 닉네임 클릭 Index
        motionNoMoveInfo: [], // 모션 움직임 없음 정보 배열
        motionNoMoveFlag: false, // 모션 움직임 없음 표시 Flag
        motionNoMoveClickIndex: null, // 모션 움직임 없음 닉네임 클릭 Index
        onlocalStreamSuccess: false, // onlocalStream이 정상적으로 됬는지 체크
        // GPS 코드 KJS.
        gpsClickInfo: null, // 지도 화면 클릭시 마커 위치 좌표 등 정보 저장,
        otherGpsList: null, // 다른사람 SELECT GPS LIST
        myGpsList: null, // 내 SELECT GPS LIST
        gpsListEvent: null, // GPS 실시간 받아오는 WATCH 소스
        fallIndex: null, // GPS용 낙하 INDEX
        noMoveIndex: null, // GPS용 움직임 INDEX
        urgentCallingFlag: false, // 긴급 통화 버튼 Flag
        emergencyId: null, // 긴급 유저
        streamMode: 0, // stram Mode (0:720 / 1: 1080) 스마트 글라스에게 받은 값
        prepareStreamMode: 0, // 스마트 글라스에게 보내는 용
        streamModeFlag: false, // streamMode 변경 Flag
        isGlassSelected: false, // 호스트가 글라스 화면 선택시 true
        sendDurationEnable: null, // 통화영상저장 여부
        useVideoRecording: null, // -1: on off기능 사용안함(무조건 저장), 0: 영상 저장 OFF , 1: 영상 저장 ON
        autoVideoSaveChange: false, // autoVideoSavechange 변경 여부 (사용자가 변경 시 true, 그 외 false)
        cameraDeviceIndex: 0, // 다중 카메라인 경우 getUserMedia 로 접근할 카메라 인덱스 번호,
        previousWorkingStatus: "",
        flag: false,
        changeZoomLevel: 1,
        enterenceCheck: 0,
        onlyVoiceID: [],
        declineStatus: false,
        onlyVoiceIDFileSent: false,
        cctvInfo: [],
        cameraNotAllowed: false,
    }),

    // Getters (게터) - computed 속성과 유사하게 상태를 계산합니다.
    getters: {
        // 예시: 특정 상태 값 반환 (state.message와 동일하지만 getter로 정의할 수도 있음)
        getPreviousWorkingStatus: (state) => state.previousWorkingStatus,
        getCallingPopupInstitution: (state) => state.callingPopupInstitution,
        getCallingPopupHeadquarters: (state) => state.callingPopupHeadquarters,
        // ... 모든 state 속성에 대한 getter를 필요에 따라 추가할 수 있습니다.
        // 하지만 Pinia에서는 state에 직접 접근하는 것이 일반적이므로 모든 state에 대한 getter가 필수는 아닙니다.
        // 복잡한 계산이 필요한 경우에 getter를 사용합니다.
        getDrawingGetFileObject: (state) => state.drawingGetFileObject,
        getCaptureImageInfo: (state) => state.captureImageInfo,
    },

    // Actions (액션) - 상태를 변경하는 모든 로직을 여기에 정의합니다.
    actions: {
        // Vuex의 mutations가 모두 이곳으로 이동합니다.
        // `this`를 사용하여 스토어의 state 및 다른 actions에 접근할 수 있습니다.

        setPreviousWorking(payload) {
            console.log("payload값 들어왔다");
            this.previousWorkingStatus = payload;
        },
        callingPopupInfo(payload) {
            this.callingPopupInstitution = payload.institution;
            this.callingPopupHeadquarters = payload.headquarters;
            this.callingPopupBranch = payload.branch;
            this.callingPopupNickname = payload.nickname;
        },
        setCallingResult(payload) {
            this.callingPopupResult = payload;
        },
        setMultiCallingResult(payload) {
            this.multiCallingResult = payload;
        },
        setCancelCallResult(payload) {
            this.cancelCallResult = payload;
        },
        setCancelCallFlag(payload) {
            this.cancelCallFlag = payload;
        },
        setGroupCallCancelFlag(payload) {
            this.groupCallCancelFlag = payload;
        },
        setVideoMainIndex(payload) {
            this.videoMainIndex = payload;
        },
        setErrorClose(payload) {
            this.errorCloseResult = payload;
        },
        setMainVideoImage(payload) {
            this.mainVideoImage = payload.type;
            this.mainVideoText = payload.text;
        },
        setVideoInfoArray(payload) {
            this.videoTagArray = payload.videoTag;
            this.videoStreamArray = payload.videoStream;
        },
        setInviteCancelFlag(payload) {
            this.inviteCancelFlag = payload;
        },
        setContectListinCalling(payload) {
            this.contectListinCalling = payload;
        },
        setUserData(payload) {
            this.userData = payload;
        },
        setUserDataAll(payload) {
            this.userDataAll = payload;
        },
        setRecentData(payload) {
            this.recentData = payload;
        },
        setRecentDataAll(payload) {
            this.recentDataAll = payload;
        },
      setUserDataStatusAtIndex(payload) {
          console.log(payload)
            if (payload.index >= 0 && payload.index < this.userData.length) {
                this.userData[payload.index] = {
                    ...this.userData[payload.index],
                    status: payload.status,
                };
                console.log("유저리스트 변경", this.userData[payload.index]);
            }
        },
      setRecentDataStatusAtIndex(payload) {
            if (payload.index >= 0 && payload.index < this.recentData.length) {
                this.recentData[payload.index] = {
                    ...this.recentData[payload.index],
                    status: payload.status,
                };
                console.log("최근통화리스트 변경", this.userData[payload.index]);
            }
        },
        pushUserData(payload) {
            this.userData.push(payload);
        },
        pushUserDataAll(payload) {
            this.userDataAll.push(payload);
        },
        pushRecentData(payload) {
            this.recentData.push(payload);
        },
        pushRecentDataAll(payload) {
            this.recentDataAll.push(payload);
        },
        setInCallingFunction(payload) {
            this.inCallingFunction = payload;
        },
        setInCallingFunctionParams(payload) {
            // 초기화
            this.inCallingFunctionParams = []; // 배열은 빈 배열로 초기화
            this.inCallingFunctionParams = payload;
        },
        setContactListShow() {
            // payload 제거, isContactListShow를 토글하는 것으로 변경
            this.isContactListShow = !this.isContactListShow;
        },
        setHostChangeRequest(payload) {
            this.hostChangeRequest = payload;
        },
        setHostRequestStatus(payload) {
            this.hostRequestStatus = payload;
        },
        setHostRequestResult(payload) {
            this.hostRequestResult = payload;
        },
        setHostRequestInfo(payload) {
            this.hostRequestNickname = payload.nickname;
            this.hostRequestInfo = payload.hostDeviceid;
        },
        setHostCancelFlag(payload) {
            this.hostCancelFlag = payload;
        },
        setAllMicMuteStatus(payload) {
            this.allMicMuteStatus = payload;
        },
        setAllMicMuteFlag(payload) {
            this.allMicMuteFlag = payload;
        },
        setMicOnOffFlag(payload) {
            this.micOnOffFlag = payload;
        },
        setForceMicOnOffFlag(payload) {
            this.forceMicOnOffFlag = payload;
        },
        setCallingWindowCount(payload) {
            this.callingWindowCount = payload;
        },
        setMicOnOffClick(payload) {
            this.micOnOffClick = payload;
        },
        setForceMicMuteIndex(payload) {
            this.forceMicMuteIndex = payload;
        },
        setForceMicMuteBtnClick(payload) {
            this.forceMicMuteBtnClick = payload;
        },
        setDrawingIframe(payload) {
            this.drawingIframe = payload;
        },
        setForceLeaveIndex(payload) {
            this.forceLeaveIndex = payload;
        },
        setForceLeaveBtnClick(payload) {
            this.forceLeaveBtnClick = payload;
        },
        setForceLeaveClickResult(payload) {
            this.forceLeaveClickResult = payload;
        },
        setTransmissionRate(payload) {
            this.TransmissionRate = payload;
        },
        setReceptionRate(payload) {
            this.ReceptionRate = payload;
        },
        setCallingType(payload) {
            this.callingType = payload;
        },
        setMyVideoStatus(payload) {
            this.myVideoStatus = payload;
        },
        setHangupCallingConfirmFlag(payload) {
            this.hangupCallingConfirmFlag = payload;
        },
        setUnderStatus(payload) {
            this.underStatus = payload;
        },
        setUploadPdfFile(payload) {
            this.uploadPdfFile = payload;
        },
        setPdfCurrentPageNum(payload) {
            this.pdfCurrentPageNum = payload;
        },
        setPdfTotalPageNum(payload) {
            this.pdfTotalPageNum = payload;
        },
        setCanvas(payload) {
            this.canvas = payload;
        },
        setReceiverImagePath(payload) {
            this.receiverImagePath = payload; // 초기화 로직은 Pinia에서 필요 없음 (덮어쓰기)
        },
        setReceiverImageDrawingMoveFlag(payload) {
            this.receiverImageDrawingMoveFlag = payload;
        },
        setCallingTimer(payload) {
            this.callingTimer = payload;
        },
        setAntennaStep(payload) {
            this.antennaStep = payload;
        },
        setAntennaInfo(payload) {
            this.calcBitrate = payload.bitrate;
            this.calcFrame = payload.frame;
            this.calcResolution = payload.resolution;
        },
        setAntennaStatus(payload) {
            this.antennaStatus = payload;
        },
        setDrawingGetFileChangeFlag(payload) {
            this.drawingGetFileChangeFlag = payload;
        },
        setDrawingGetFileObject(payload) {
            this.drawingGetFileObject = payload;
        },
        setDrawingGetFileSrc(payload) {
            this.drawingGetFileSrc = payload;
        },
        setDrawingGetPDFUploadFlag(payload) {
            this.drawingGetPDFUploadFlag = payload;
        },
        setDrawingGetPDFUploadObject(payload) {
            this.drawingGetPDFUploadObject = payload;
        },
        setDrawingGetPDFUploadSrc(payload) {
            this.drawingGetPDFUploadSrc = payload;
        },
        setMainVideoFullScreen(payload) {
            this.mainVideoFullScreen = payload;
        },
        setMainVideoFullScreenText(payload) {
            this.mainVideoFullScreenText = payload;
        },
        setUniqueRoomid(payload) {
            this.uniqueRoomid = payload;
        },
        setPDFUploadProgrss(payload) {
            this.pdfUploadProgrss = payload;
        },
        setPDFUploading(payload) {
            this.pdfUploading = payload;
        },
        pushPdfUploadQueArray(payload) {
            const queArray = {
                // new Object() 대신 객체 리터럴 사용
                name: payload.drawingPDFName,
                size: payload.drawingPDFSize,
                src: payload.drawingPDFSrc,
                groupIndex: payload.groupIndex,
            };
            this.pdfUploadQueArray.push(queArray);
            console.log("pdfUploadQueArray", this.pdfUploadQueArray);
        },
        removePdfUploadQueArray() {
            // payload 제거
            this.pdfUploadQueArray.shift();
        },
        setPDFcancelUploadFlag(payload) {
            this.PDFcancelUploadFlag = payload;
        },
        setLaserPointerLaction(payload) {
            this.laserPointerLaction = []; // 초기화
            const locationArray = {
                // new Object() 대신 객체 리터럴 사용
                x: payload.x,
                y: payload.y,
            };
            this.laserPointerLaction.push(locationArray);
        },
        setLaserPointerFlag(payload) {
            this.laserPointerFlag = payload;
        },
        setLaserPointerShow(payload) {
            this.laserPointerShow = payload;
        },
        isCapture(payload) {
            this.isCapture = payload;
        },
        setCaptureSaveFlag(payload) {
            this.captureSaveFlag = payload;
        },
        setHQCaptureShow(payload) {
            this.HQCaptureShow = payload;
        },
        setCaptureImageInfo(payload) {
            this.captureImageInfo = {
                // new Object() 대신 객체 리터럴 사용
                fileSrc: payload.fileSrc,
                fileName: payload.fileName,
                fileSize: payload.fileSize,
            };
        },
        setGlobalVideoSend(payload) {
            this.globalVideoSend = payload;
        },
        setGlobalAudioSend(payload) {
            this.globalAudioSend = payload;
        },
        setDrawingMoveToScreen(payload) {
            this.drawingMoveToScreen = payload;
        },
        setScreenMoveToDrawing(payload) {
            this.screenMoveToDrawing = payload;
        },
        setHQCaptrueFlag(payload) {
            this.HQCaptureFlag = payload;
        },
        setAutoCallAcceptTime(payload) {
            this.autoCallAcceptTime = payload;
        },
        setAutoPictureAccept(payload) {
            this.autoPictureAccept = payload;
        },
        setAutoDiscalling(payload) {
            this.autoDiscalling = payload;
        },
        setAutoDiscallingCancel(payload) {
            this.autoDiscallingCancel = payload;
        },
        setAutoDiscallingResult(payload) {
            this.autoDiscallingResult = payload;
        },
        addMotionFallInfo(payload) {
            const motionArray = {
                // new Object() 대신 객체 리터럴 사용
                deviceid: payload.deviceid,
                datetime: payload.datetime,
                datetimeUTC: payload.datetimeUTC,
                status: payload.status,
                nickname: payload.nickname,
                rfid: payload.rfid,
                rfIndex: payload.rfIndex,
            };
            this.motionFallInfo.push(motionArray);
        },
        setMotionFallStatus(payload) {
            this.motionFallInfo[payload.index].status = payload.status;
        },
        clearMotionFallInfo() {
            // payload 제거
            this.motionFallInfo = [];
        },
        setMotionFallFlag(payload) {
            this.motionFallFlag = payload;
        },
        setMotionFallCloseBtnClick(payload) {
            this.motionFallCloseBtnClick = payload;
        },
        setMotionFallClickIndex(payload) {
            this.motionFallClickIndex = payload;
        },
        addMotionNoMoveInfo(payload) {
            const motionArray = {
                // new Object() 대신 객체 리터럴 사용
                deviceid: payload.deviceid,
                datetime: payload.datetime,
                datetimeUTC: payload.datetimeUTC,
                status: payload.status,
                nickname: payload.userNickname, // userNickname 사용
                rfid: payload.rfid,
                rfIndex: payload.rfIndex,
            };
            this.motionNoMoveInfo.push(motionArray);
        },
        setMotionNoMoveStatus(payload) {
            this.motionNoMoveInfo[payload.index].status = payload.status;
        },
        deleteMotionNoMoveInfo(payload) {
            this.motionNoMoveInfo.splice(payload, 1);
        },
        setMotionNoMoveFlag(payload) {
            this.motionNoMoveFlag = payload;
        },
        setMotionNoMoveClickIndex(payload) {
            this.motionNoMoveClickIndex = payload;
        },
        setOnlocalStreamSuccess(payload) {
            this.onlocalStreamSuccess = payload;
        },
        setGpsClickInfo(payload) {
            this.gpsClickInfo = payload;
        },
        setOtherGpsList(payload) {
            this.otherGpsList = payload;
        },
        setMyGpsList(payload) {
            this.myGpsList = payload;
        },
        setMyGpsListPush(payload) {
            if (this.myGpsList) {
                // myGpsList가 null이 아닌 경우에만 push
                this.myGpsList.push(payload);
            } else {
                // myGpsList가 null일 경우, 새 배열로 초기화 후 push
                this.myGpsList = [payload];
            }
        },
        setGpsListEvent(payload) {
            this.gpsListEvent = payload;
        },
        setGpsFallIndex(payload) {
            this.fallIndex = payload;
        },
        setGpsNoMoveIndex(payload) {
            this.noMoveIndex = payload;
        },
        setUrgentCallingFlag(payload) {
            this.urgentCallingFlag = payload;
        },
        setEmergencyId(payload) {
            this.emergencyId = payload;
        },
        setStreamMode(payload) {
            this.streamMode = payload;
        },
        setStreamModeFlag(payload) {
            this.streamModeFlag = payload;
        },
        setIsGlassSelected(payload) {
            this.isGlassSelected = payload;
        },
        setPrepareStreamMode(payload) {
            this.prepareStreamMode = payload;
        },
        setSendDurationEnable(payload) {
            this.sendDurationEnable = payload;
        },
        setUseVideoRecording(payload) {
            this.useVideoRecording = payload;
        },
        setAutoVideoSaveChange(payload) {
            this.autoVideoSaveChange = payload;
        },
        setCameraDeviceIndex(payload) {
            console.log("cameraDeviceIndex actions", payload); // actions로 변경되었으므로 콘솔 메시지 수정
            this.cameraDeviceIndex = payload;
        },
        toggleFlag() {
            // payload 제거, 토글 로직
            console.log(this.flag);
            this.flag = !this.flag;
            console.log(this.flag);
        },
        setChangeZoomLevel(payload) {
            // 이름 변경: changeZoomLevel -> setChangeZoomLevel (mutation 이름과 통일)
            console.log(payload);
            this.changeZoomLevel = payload;
            console.log(payload);
        },
        setEnterenceCheck(payload) {
            this.enterenceCheck = payload;
        },
        setOnlyVoiceID(payload) {
            this.onlyVoiceID = payload;
        },
        toggleDeclineStatus() {
            // payload 제거, 토글 로직
            this.declineStatus = !this.declineStatus;
        },
        setOnlyVoiceIDFileSent(payload) {
            this.onlyVoiceIDFileSent = payload;
        },
        setCameraNotAllowed(payload) {
            this.cameraNotAllowed = payload;
        },
        setCctvInfo(payload) {
            this.cctvInfo = payload;
        },
    },
});