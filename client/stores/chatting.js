// stores/chatting.ts
import { defineStore } from 'pinia';

export const useChattingStore = defineStore('chatting', {
  state: () => ({
    // State (상태)
    chattingMessageList: [],
    sendMessageFlag: false,
    sendMessageInfo: [], // 배열로 초기화 (원래 Object였지만, push하는 패턴으로 보아 배열이 더 적합)
    newMessageConfrim: false,
    newEmergencyConfirm: false,
    videoCallHost: false,
    personnelInRoom: 0,
    chattingShow: false,
  }),

  // Getters (게터) - 필요시 추가
  getters: {
    // 예: getChattingMessageList: (state) => state.chattingMessageList,
  },

  // Actions (액션) - 상태를 변경하는 모든 로직을 여기에 정의합니다.
  actions: {
    messageListInit() {
      this.chattingMessageList = [];
    },
    sendMessage(payload) {
      const messageInfo = { // new Object() 대신 객체 리터럴 사용
        nickname: payload.nickname,
        date: payload.date,
        chattingDate: payload.chattingDate,
        message: payload.message,
        level: payload.level,
        type: payload.type,
        isEmergency: false, // 기본값 설정
        mainVideoName: "", // 기본값 설정
        emergencyIcon: "", // 기본값 설정
        moveIcon: "", // 기본값 설정
        directionIcon: "", // 기본값 설정
      };

      // type : 긴급
      if (payload.level === 0) { // === 사용
        messageInfo.isEmergency = true;
      }

      let mainVideoName;
      // DOM 접근은 스토어에서 권장되지 않지만, 원본 코드 유지
      // if (typeof document !== 'undefined' && document.getElementById("videoMainName")) {
      //   mainVideoName = document.getElementById("videoMainName").textContent;
      // }

      // icon
      if (payload.type === 1) { // === 사용
        messageInfo.mainVideoName = mainVideoName;
        messageInfo.emergencyIcon = payload.message;
      } else if (payload.type === 2) { // === 사용
        messageInfo.mainVideoName = mainVideoName;
        messageInfo.moveIcon = payload.message;
      } else if (payload.type === 4) { // === 사용
        messageInfo.mainVideoName = mainVideoName;
        messageInfo.directionIcon = payload.message;
      }

      // JSON.stringify / parse 없이 직접 객체를 push
      this.chattingMessageList.push(messageInfo);

      // sendMessageInfo init (이 부분은 Vuex 패턴을 Pinia로 옮긴 것으로, 필요에 따라서는 다르게 처리될 수 있습니다.)
      this.sendMessageInfo = [];
      this.sendMessageInfo.push(messageInfo); // 동일한 객체 참조를 push
    },
    setSendMessageFlag(payload) {
      this.sendMessageFlag = payload;
    },
    sendMessageInfoInit() {
      this.sendMessageInfo = [];
    },
    receiveMessage(payload) {
      const receiveMessageInfo = { // new Object() 대신 객체 리터럴 사용
        nickname: payload.nickname,
        date: payload.date,
        chattingDate: payload.chattingDate,
        message: payload.message,
        isReceived: true,
        type: payload.type,
        isEmergency: false, // 기본값 설정
        mainVideoName: "", // 기본값 설정
        emergencyIcon: "", // 기본값 설정
        moveIcon: "", // 기본값 설정
        calling: false, // 기본값 설정
        directionIcon: "", // 기본값 설정
        fileSend: false, // 기본값 설정
      };

      // type : 긴급
      if (payload.level === 0) { // === 사용
        receiveMessageInfo.isEmergency = true;
      }

      // icon
      if (payload.type === 1) { // === 사용
        receiveMessageInfo.mainVideoName = payload.mainVideoName;
        receiveMessageInfo.emergencyIcon = payload.message;
      } else if (payload.type === 2) { // === 사용
        receiveMessageInfo.mainVideoName = payload.mainVideoName;
        receiveMessageInfo.moveIcon = payload.message;
      } else if (payload.type === 3) { // === 사용
        receiveMessageInfo.calling = true;
      } else if (payload.type === 4) { // === 사용
        receiveMessageInfo.mainVideoName = payload.mainVideoName;
        receiveMessageInfo.directionIcon = payload.message;
      } else if (payload.type === 5) { // === 사용
        receiveMessageInfo.fileSend = true;
      }

      // JSON.stringify / parse 없이 직접 객체를 push
      this.chattingMessageList.push(receiveMessageInfo);
    },
    setNewMessageConfrim(payload) {
      this.newMessageConfrim = payload;
    },
    setNewEmergencyConfirm(payload) {
      this.newEmergencyConfirm = payload;
    },
    setVideoCallHost(payload) {
      console.log(payload)
      this.videoCallHost = payload;
    },
    setPersonnelInRoom(payload) {
      this.personnelInRoom = payload;
    },
    setChattingShow() { // payload 제거, 토글 로직
      this.chattingShow = !this.chattingShow;
    }
  },
});