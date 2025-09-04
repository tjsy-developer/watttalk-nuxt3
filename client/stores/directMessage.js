// stores/directMessage.ts
import { timestamp } from "@vueuse/core";
import { defineStore } from "pinia";
// 만약 moduleA가 Pinia 스토어라면, 아래와 같이 임포트하여 사용합니다.
// 예시: import { useModuleAStore } from '~/stores/moduleA';

export const useDirectMessageStore = defineStore("directMessage", {
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
        previousMessageNone: false,
        // ================================================

        totalChatCnt: 0,
        openMessageList: [],
        prevMessageFocusUser: "",
    }),

    // Getters (현재 비어있으므로 선택 사항)
    getters: {},

    // Actions (액션) - 상태를 변경하는 모든 로직을 여기에 정의합니다.
    actions: {
        setChatModalAdd(payload) {
            this.totalChatCnt = this.totalChatCnt + 1;
        },
        setRemoteMessageList(payload) {
            try {
                const index = this.openMessageList.findIndex(
                    (item) => item.remoteDeviceId === payload.remoteDeviceId,
                );
                console.log("pinia");
                if (index == -1) {
                    this.openMessageList.push({
                        remoteDeviceId: payload.remoteDeviceId,
                        messageList: [],
                    });
                }
            } catch (error) {
                console.log(error);
            }
        },
        setAddSendMessage(payload) {
            const index = this.openMessageList.findIndex(
                (item) => item.remoteDeviceId === payload.receiver,
            );
            console.log(index);
            if (index !== -1) {
                // messageList 배열이 없으면 초기화
                if (!this.openMessageList[index].messageList) {
                    this.openMessageList[index].messageList = [];
                    this.openMessageList[index].isLastMessage = false;
                }

                // 메시지 추가
                this.openMessageList[index].messageList.push({
                    sender: payload.sender,
                    receiver: payload.receiver,
                    message: payload.message,
                    timestamp: payload.timestamp,
                    datetime: payload.dateTime,
                    read: payload.read,
                });
            }
        },
        setAddReceiveMessage(payload) {
            const index = this.openMessageList.findIndex(
                (item) => item.remoteDeviceId === payload.sender,
            );
            console.log(index);
            if (index !== -1) {
                // messageList 배열이 없으면 초기화
                if (!this.openMessageList[index].messageList) {
                    this.openMessageList[index].messageList = [];
                    this.openMessageList[index].isLastMessage = false;
                }

                // 메시지 추가
                this.openMessageList[index].messageList.push({
                    sender: payload.sender,
                    receiver: payload.receiver,
                    message: payload.message,
                    timestamp: payload.timestamp,
                    datetime: payload.dateTime,
                    read: payload.read,
                });
            }
        },
        setReadMessage(payload) {
            const index = this.openMessageList.findIndex(
                (item) => item.remoteDeviceId === payload.remoteDeviceId,
            );
            if (index !== -1) {
                if (!this.openMessageList[index].messageList) {
                    this.openMessageList[index].messageList = [];
                    this.openMessageList[index].isLastMessage = false;
                }

                this.openMessageList[index].messageList = this.openMessageList[
                    index
                ].messageList.map((value) => {
                    return {
                        ...value,
                        read: true,
                    };
                });
            }
        },
        setAddPrevMessage(payload) {
            const index = this.openMessageList.findIndex(
                (item) => item.remoteDeviceId === this.prevMessageFocusUser,
            );
            if (index !== -1) {
                if (!this.openMessageList[index].messageList) {
                    this.openMessageList[index].messageList = [];
                    this.openMessageList[index].isLastMessage = false;
                }

                this.openMessageList[index].messageList.unshift({
                    sender: payload.sender,
                    receiver: payload.receiver,
                    message: payload.message,
                    timestamp: payload.timestamp,
                    datetime: payload.dateTime,
                    read: payload.read,
                });
            }
        },
        setPrevMessageFocusUser(payload) {
            this.prevMessageFocusUser = payload;
        },
        setIsLastMessage() {
            const index = this.openMessageList.findIndex(
                (item) => item.remoteDeviceId === this.prevMessageFocusUser,
            );
            if (index !== -1) {
                this.openMessageList[index].isLastMessage = true
            }
        },
    },
});
