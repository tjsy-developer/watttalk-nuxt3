// stores/directCall.ts
import { defineStore } from 'pinia';

export const useDirectCallStore = defineStore('directCall', {
  state: () => ({
    // State (상태)
    directcallList: [],
    uniqueRoomId: ""
  }),

  // Getters (현재 비어있으므로 선택 사항)
  getters: {
    // 예시: getDirectCallList: (state) => state.directcallList,
    // 필요에 따라 여기에 계산된 상태를 추가할 수 있습니다.
  },

  // Actions (액션) - 상태를 변경하는 모든 로직을 여기에 정의합니다.
  actions: {
    setDirectCallInfo(payload) {
      const obj = { // new Object() 대신 객체 리터럴 사용
        meeting_seq: payload.meeting_seq,
        member_name: payload.member_name,
        subject: payload.subject,
      };
      this.directcallList.push(obj);
    },
    clearDirectCallInfo() { // payload 없음
      this.directcallList.pop();
    },
    resetDirectCallInfo() { // payload 없음
      this.directcallList = [];
    },
    setUniqueRoomId(payload) {
      this.uniqueRoomId = payload;
    }
  }
});