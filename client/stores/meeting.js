// stores/meeting.ts (or a more specific name like calendar.ts)
import { defineStore } from "pinia";

export const useMeetingStore = defineStore("meeting", {
    state: () => ({
        emails: [],
        meetingList: [], // Initial state as an empty array, comments removed
        myList: [],
        meetingCalendar: [],
        meetingMemberId: [],
        meetingMember: [],
        meetingMemberEmail: [],
        meetingSaveInfo: null,
        meetingSaveFlag: false,
        meetingSeq: null,
        meetingDeleteFlag: false,
        meetingOpenFlag: false,
        meetingJoinFlag: false,
        meetingLeaveFlag: false,
        meetingListMonthFlag: false,
        meetingListMonthInfo: [],
        meetingModifyFlag: false,
        meetingModifyInfo: null,
        openAndJoin: "",
        btnClick: true,
        currentMeetingSubject: "",
        currentMeetingSeq: "",
        currentMeetingStartTime: "",
        currentMeetingEndTime: "",
        currentMeetingRoomid: "",
        currentMeetingMaker: "", // Added as it's used in setCurrentMeetingInfo
        cctvList: [],
        meetingAlertStatus: 0,
        reservId: "",
        openMeetingData: "",
        openMeetingCheck: "",
        meetingViewType: "",
    }),

    getters: {
        // Getters would go here if you had any. For example:
        // getMeetingCount: (state) => state.meetingList.length,
    },

    actions: {
        deleteMeetingRoom(index) {
            // Find the element in meetingList at the given index
            const meetingToDelete = this.meetingList[index];

            // Remove from meetingList
            this.meetingList.splice(index, 1);

            // Find and remove the corresponding element from myList
            const myIndex = this.myList.findIndex(
                (element) => element === meetingToDelete,
            );
            if (myIndex !== -1) {
                this.myList.splice(myIndex, 1);
            }
        },
        deleteMeetingRoom2(index) {
            // This seems to be a duplicate or slightly different logic for myList first
            const myMeetingToDelete = this.myList[index];

            // Remove from myList
            this.myList.splice(index, 1);

            // Find and remove the corresponding element from meetingList
            const meetingIndex = this.meetingList.findIndex(
                (element) => element === myMeetingToDelete,
            );
            if (meetingIndex !== -1) {
                this.meetingList.splice(meetingIndex, 1);
            }
        },
        // The commented-out `myView` mutation is left out as it's commented in the original.
        // If it were active, it would become an action.

        // 날짜별 시간별 정렬하는 구문
        sortArray() {
            const sortLogic = (a, b) => {
                const aa = a.customData.time.split(":");
                const bb = b.customData.time.split(":");
                const aT = Number(aa[0]);
                const bT = Number(bb[0]);

                const dateA = new Date(a.dates);
                const dateB = new Date(b.dates);

                if (dateA < dateB) return -1;
                if (dateA > dateB) return 1;

                if (aT < bT) return -1;
                if (aT > bT) return 1;
                return 0;
            };

            this.meetingList.sort(sortLogic);
            this.myList.sort(sortLogic);
        },
        dateChange() {
            // Create a new array to avoid direct modification issues during iteration if any
            const meetingCal = this.meetingList.map((item) => ({
                ...item,
                dates: new Date(item.dates), // Assuming item.dates is a string initially
            }));
            this.meetingCalendar = meetingCal;
        },
        emailAdd(payload) {
            this.emails.push(payload);
        },
        emailDelete(index) {
            // Using filter for immutability and easier logic
            const initialLength = this.emails.length;
            this.emails = this.emails.filter((email) => email.emailNum !== index);
            // Alternative:
            // const num = this.emails.findIndex(email => email.emailNum === index);
            // if (num !== -1) {
            //   this.emails.splice(num, 1);
            // }
        },
        emailDeleteAll() {
            this.emails = [];
        },
        // 회의 목록에 회의를 추가 하기 위함
        setMeetingListAdd(payload) {
            this.meetingList.push(payload);
        },
        // 회의 생성 - 멤버 선택 시 아이디 추가
        meetingMemberIdAdd(payload) {
            this.meetingMemberId.push(payload);
        },
        // 회의 저장 - 멤버 아이디 초기화
        meetingMemberIdAllDelete() {
            this.meetingMemberId = [];
        },
        // 회의 저장 - 멤버 아이디 하나 제거
        meetingMemberIdDelete(payload) {
            this.meetingMemberId = this.meetingMemberId.filter((id) => id !== payload);
        },
        // 회의 생성 - 멤버 선택 시 이름 추가
        meetingMemberAdd(payload) {
            this.meetingMember = [...payload];
        },
        // 회의 저장 - 멤버 이름 초기화
        meetingMemberDeleteAll() {
            this.meetingMember = [];
        },
        // 회의 생성 - 멤버 선택 시 이메인 추가
        meetingMemberEmailAdd(payload) {
            this.meetingMemberEmail.push(payload);
        },
        // 회의 저장 - 멤버 이메일 하나 제거
        meetingMemberEmailDelete(payload) {
            this.meetingMemberEmail = this.meetingMemberEmail.filter(
                (email) => email !== payload,
            );
        },
        // 회의 저장 - 멤버 이메일 초기화
        meetingMemberEmailDeleteAll() {
            this.meetingMemberEmail = [];
        },
        // 회의 목록을 초기화 하기 위함
        setMeetingListEmpty() {
            this.meetingList = [];
        },
        // 해당 월에 대한 정보를 넣어두는 vuex
        meetingListMonthInfo(payload) {
            this.meetingListMonthInfo = payload;
        },
        // 회의 월력 요청시 부모의 소켓을 실행시켜야하기 때문에 vuex 생성
        setMeetingListMonthFlag(payload) {
            this.meetingListMonthFlag = payload;
        },
        // 회의 저장 시 회의 정보를 담아 놓는 것
        setMeetingSaveInfo(payload) {
            this.meetingSaveInfo = payload;
        },
        // 회의 저장 시 부모의 소켓을 실행시켜야하기 때문에 vuex 생성
        setMeetingSaveFlag(payload) {
            this.meetingSaveFlag = payload;
        },
        // 회의실의 시퀀스를 저장해둔다.
        setMeetingSeq(payload) {
            this.meetingSeq = payload;
        },
        // 회의실 삭제 시 부모의 소켓을 실행시켜야하기 때문에 vuex 생성
        meetingDeleteFlag(payload) {
            this.meetingDeleteFlag = payload;
        },
        // 회의실 개설 시 부모의 소켓을 실행시켜야하기 때문에 vuex 생성
        setMeetingOpenFlag(payload) {
            this.meetingOpenFlag = payload;
        },
        // 회의실 참가 시 부모의 소켓을 실행시켜야하기 때문에 vuex 생성
        setMeetingJoinFlag(payload) {
            this.meetingJoinFlag = payload;
        },
        // 회의실 퇴장 시 부모의 소켓을 실행시켜야하기 때문에 vuex 생성
        setMeetingLeaveFlag(payload) {
            this.meetingLeaveFlag = payload;
        },
        // createRoomId 를 호출 후 회의실 개설 함수를 실행할지, 참가 함수를 실행할지 결정하는 부분
        setOpenAndJoin(payload) {
            this.openAndJoin = payload;
        },
        setMeetingModifyFlag(payload) {
            this.meetingModifyFlag = payload;
        },
        setMeetingModifyInfo(payload) {
            this.meetingModifyInfo = payload;
        },
        saveBtnClick(payload) {
            this.btnClick = payload;
        },
        // 현재 사용중인 회의 정보 저장
        setCurrentMeetingInfo(payload) {
            if (payload === null) {
                this.currentMeetingSubject = "";
                this.currentMeetingSeq = "";
                this.currentMeetingRoomid = "";
                this.currentMeetingStartTime = "";
                this.currentMeetingEndTime = "";
                this.currentMeetingMaker = "";
                this.cctvList = [];
            } else {
                this.currentMeetingSubject = payload.subject;
                this.currentMeetingSeq = payload.meetingSeq;
                this.currentMeetingRoomid = payload.roomid;
                this.currentMeetingStartTime = payload.startTime;
                this.currentMeetingEndTime = payload.endTime;
                this.currentMeetingMaker = payload.maker;
                this.cctvList = payload.cctvList;
            }
        },
        // - 비회원 초대 모달 상태 변경
        setMeetingAlertStatus(payload) {
            this.meetingAlertStatus = payload;
        },
        setReservId(payload) {
            this.reservId = payload;
        },
        setOpenMeetingData(payload) {
            this.openMeetingData = payload;
        },
        setOpenMeetingCheck(payload) {
            // Payload type depends on its actual use
            this.openMeetingCheck = payload;
        },
        changeMeetingViewType(payload) {
            this.meetingViewType = payload;
        },
    },
});
