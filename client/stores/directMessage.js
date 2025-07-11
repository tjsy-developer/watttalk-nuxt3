// stores/directMessage.ts
import { defineStore } from 'pinia';
// 만약 moduleA가 Pinia 스토어라면, 아래와 같이 임포트하여 사용합니다.
// 예시: import { useModuleAStore } from '~/stores/moduleA';

export const useDirectMessageStore = defineStore('directMessage', {
  state: () => ({
    // State (상태)
    directMessageList: [],
    sendDMFlag: false,
    chattingModal: [], // chattingModal은 객체 배열이 될 것으로 예상되므로, 빈 배열로 초기화
    readProcFlag: false,
    readMessageInfo: [], // 배열로 초기화
    enterNewMessageBtn: false, // 새로운 메세지가 있어서 메세지 버튼을 클릭하여 입장할 경우 쓸 구분자
    pastReadDatetime: null,
    directMessageSequence: [], // 배열로 초기화
    previousMessageFlag: false, // 이전 메세지 버튼 클릭
    previousMessageInfo: "", // 이전 메세지 관련 모달 창의 deviceid 저장
    previousMessageCount: 10, // 이전 메세지 가져올 갯수,
    previousMessageNone: false
  }),

  // Getters (현재 비어있으므로 선택 사항)
  getters: {},

  // Actions (액션) - 상태를 변경하는 모든 로직을 여기에 정의합니다.
  actions: {
    sendDM(payload) {
      const directMessage = { // new Object() 대신 객체 리터럴 사용
        message: payload.message,
        type: 0,
        sender: payload.sender,
        receiver: payload.receiver,
        senderNickname: payload.senderNickname,
        receiverNickname: payload.receiverNickname,
        readFlag: false,
        datetime: payload.datetime,
        chattingDateTime: payload.chattingDateTime
      };
      this.directMessageList.push(directMessage); // JSON.stringify/parse 제거
    },
    receiveDM(payload) {
      // moduleA.userDevice 접근을 위한 스토어 인스턴스 가져오기 (가정)
      // const moduleAStore = useModuleAStore(); // 만약 moduleA가 Pinia 스토어라면 이렇게 사용

      const directMessage = { // new Object() 대신 객체 리터럴 사용
        message: payload.message,
        type: 1,
        sender: payload.sender,
        receiver: payload.receiver,
        senderNickname: payload.senderNickname,
        receiverNickname: payload.receiverNickname,
        readFlag: false,
        datetime: payload.datetime,
        chattingDateTime: payload.chattingDateTime
      };
      this.directMessageList.push(directMessage); // JSON.stringify/parse 제거

      // 가장 처음에 뜬 directChattingModal의 deviceId로 인덱스를 찾는다
      // directMessageSequence[0]가 있을 때만 findIndex 호출
      const firstSequenceId = this.directMessageSequence.length > 0 ? this.directMessageSequence[0] : null;
      const index = firstSequenceId !== null ? this.chattingModal.findIndex(
          obj => obj.receiverDeviceid === firstSequenceId
      ) : -1;

      // 원본 코드의 주석 처리된 부분 (DOM 접근)은 Pinia 스토어에서는 적절하지 않으므로 제외
      // console.log("current userDevice ? ", moduleA.userDevice); // Vuex 모듈 접근 방식
      // Pinia에서는 해당 스토어 임포트 후 접근: console.log("current userDevice ? ", moduleAStore.userDevice); // 예시

      let messageLimitCount = 10;
      // moduleA.userDevice 대신 Pinia 스토어를 사용해야 함 (가정)
      // if (moduleAStore.userDevice === "Mobile") { // 예시
      //   messageLimitCount = 1;
      // }
      // 임시로 하드코딩 또는 다른 방법으로 deviceCheck 로직 구현 필요
      // 여기서는 원본 Vuex의 로직을 그대로 옮김 (userDevice가 정의되지 않았다고 가정)
      // 실제 프로젝트에서는 moduleA의 userDevice 값을 Pinia 스토어로 마이그레이션하여 사용해야 합니다.
      const isMobile = false; // 실제 device detection 로직으로 대체 필요
      if (isMobile) {
          messageLimitCount = 1;
      }


      if (index !== -1 && this.directMessageSequence.length >= messageLimitCount) {
        const result = this.directMessageSequence.includes(directMessage.sender);
        if (result) {
          this.directMessageSequence = this.directMessageSequence.filter(
            n => n !== directMessage.sender
          );
          this.directMessageSequence.push(directMessage.sender);
        } else {
          this.directMessageSequence = this.directMessageSequence.filter(
            n => n !== this.directMessageSequence[0]
          );
          console.log(
            "Modal shown for the first time Index -- ",
            this.chattingModal.findIndex(
              obj => obj.receiverDeviceid === this.directMessageSequence[0]
            )
          );
          if (this.chattingModal[index].showResult === true) {
            this.chattingModal[index].showResult = false; // Vue.set 제거하고 직접 할당
          }
        }
      }
    },
    setSendDMFlag(payload) {
      this.sendDMFlag = payload;
    },
    addChattingModal(payload) {
      if (payload === "init") {
        this.chattingModal = [];
      } else if (this.chattingModal.length === 0) {
        // 최초 모달 생성 시
        const chattingModalData = { // new Object() 대신 객체 리터럴 사용
          receiverDeviceid: payload.deviceid,
          receiverNickname: payload.nickname,
          showResult: true
        };
        // 맨 처음으로 show된 모달의 해당 deviceId 추가 -ksy
        this.directMessageSequence.push(payload.deviceid);
        this.chattingModal.push(chattingModalData); // JSON.stringify/parse 제거
      } else {
        let found = false;
        for (let i = 0; i < this.chattingModal.length; i++) {
          // 현재 chattingModal 목록 중 해당 id가 있을 경우
          if (this.chattingModal[i].receiverDeviceid === payload.deviceid) {
            if (this.chattingModal[i].showResult === false) {
              this.chattingModal[i].showResult = true; // Vue.set 제거하고 직접 할당

              // directMessageModal deviceId 넣기 --> 10개의 창 제한을 위해서 넣음
              this.directMessageSequence.push(payload.deviceid);
              // console.log(this.chattingModal)
            }
            found = true;
            break; // 해당 id를 찾았으므로 루프 종료
          }
        }
        // 현재 chattingModal 목록 중 해당 id가 없을 경우에만 추가
        if (!found) {
          const chattingModalData = { // new Object() 대신 객체 리터럴 사용
            receiverDeviceid: payload.deviceid,
            receiverNickname: payload.nickname,
            showResult: true
          };
          // directMessageModal deviceId 넣기 --> 10개의 창 제한을 위해서 넣음
          this.directMessageSequence.push(payload.deviceid);
          this.chattingModal.push(chattingModalData); // JSON.stringify/parse 제거
        }
      }
    },
    setReadProcFlag(payload) {
      this.readProcFlag = payload;
    },
    setReadMessageInfo(payload) {
      this.readMessageInfo = []; // 초기화
      const readMessage = { // new Object() 대신 객체 리터럴 사용
        sender: payload.sender,
        receiver: payload.receiver,
        datetime: payload.datetime
      };
      this.readMessageInfo.push(readMessage); // JSON.stringify/parse 제거
    },
    setReadMessage(payload) {
      // directMessage List 수정
      this.directMessageList[payload.index].readFlag = true; // Vue.set 제거하고 직접 할당
    },
    setPastReadDatetime(payload) {
      this.pastReadDatetime = payload;
    },
    setPreviousMessageFlag(payload) {
      this.previousMessageFlag = payload;
    },
    setPreviousMessageInfo(payload) {
      this.previousMessageInfo = payload;
    },
    previousSendDM(payload) {
      // console.log(payload.readCheck)
      const directMessage = { // new Object() 대신 객체 리터럴 사용
        message: payload.message,
        type: 0,
        sender: payload.sender,
        receiver: payload.receiver,
        senderNickname: payload.senderNickname,
        receiverNickname: payload.receiverNickname,
        readFlag: payload.readCheck,
        datetime: payload.datetime,
        chattingDateTime: payload.chattingDateTime
      };
      this.directMessageList.unshift(directMessage); // JSON.stringify/parse 제거
    },
    previousReceiveDM(payload) {
      const directMessage = { // new Object() 대신 객체 리터럴 사용
        message: payload.message,
        type: 1,
        sender: payload.sender,
        receiver: payload.receiver,
        senderNickname: payload.senderNickname,
        receiverNickname: payload.receiverNickname,
        readFlag: payload.readCheck,
        datetime: payload.datetime,
        chattingDateTime: payload.chattingDateTime
      };
      this.directMessageList.unshift(directMessage); // JSON.stringify/parse 제거
    },
    setPreviousMessageNone(payload) {
      this.previousMessageNone = payload;
    }
  }
});