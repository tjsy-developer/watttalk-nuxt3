// stores/modal.js
import { defineStore } from "pinia";

export const useModalStore = defineStore("modal", {
    state: () => ({
        // ✨ currentModal을 배열로 변경 ✨
        activeModals: [], // 현재 열려 있는 모달들의 타입 (예: ['login', 'confirm'])
        modalData: {}, // 각 모달 타입별 데이터를 저장할 객체 (예: { login: { ... }, confirm: { ... } })
        modalResolves: {}, // 각 모달 타입별 Promise resolve 함수를 저장할 객체
    }),
    actions: {
        // 모달 열기 액션
        openModal(type, data = {}) {
            console.log(data)
            // 이미 열려 있는 모달인지 확인하여 중복 추가 방지
            if (!this.activeModals.includes(type)) {
                this.activeModals.push(type); // 배열에 모달 타입 추가
            }
            this.modalData[type] = data; // 해당 모달 타입의 데이터 저장

            return new Promise((resolve) => {
                this.modalResolves[type] = resolve; // 해당 모달 타입의 resolve 함수 저장
            });
        },

        // 특정 모달 닫기 액션
        closeModal(type, result = {}) {
            // 배열에서 해당 모달 타입 제거
            this.activeModals = this.activeModals.filter(
                (modalType) => modalType !== type,
            );

            // 해당 모달의 Promise를 resolve
            if (this.modalResolves[type]) {
                this.modalResolves[type](result);
                delete this.modalResolves[type]; // 사용된 resolve 함수 제거
            }
            delete this.modalData[type]; // 사용된 데이터 제거
            console.log(`${type} 모달이 닫혔습니다.`);
        },

        // ✨ 모든 모달을 강제로 닫는 액션 ✨
        closeAllModals() {
            // 열려있는 모든 모달의 Promise를 resolve (취소로 간주)
            for (const type of this.activeModals) {
                if (this.modalResolves[type]) {
                    this.modalResolves[type](false); // 모든 모달을 false로 resolve
                }
            }
            this.activeModals = []; // 배열 비우기
            this.modalData = {}; // 데이터 객체 비우기
            this.modalResolves = {}; // resolve 함수 객체 비우기
            console.log("모든 모달이 닫혔습니다.");
        },
    },
    getters: {
        // 특정 모달이 열려 있는지 확인하는 getter
        isModalOpen: (state) => (type) => state.activeModals.includes(type),
        // 특정 모달의 데이터를 가져오는 getter
        getModalData: (state) => (type) => state.modalData[type],
        // 현재 열려 있는 모든 모달의 타입을 가져오는 getter
        getAllActiveModalTypes: (state) => state.activeModals,
	},
});
