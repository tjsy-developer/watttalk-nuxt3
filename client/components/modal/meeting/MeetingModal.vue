<template>
    <VueFinalModal
        :v-model="true"
        :clickToClose="false"
        class="modal-container meeting-modal"
    >
        <div class="makeMain">
            <div class="titleLine">
                <span v-if="!props.compData" class="modalFont22">{{
                    t("회의 생성")
                }}</span>
                <span v-if="props.compData" class="modalFont22">{{
                    t("회의 수정")
                }}</span>
                <img
                    src="@/assets/images/conference/ic_hm_active_1.png"
                    class="imgSize"
                />
            </div>
            <div class="inputBox">
                <div class="label-box">
                    <span class="firstLabel">{{ t("회의 제목") }}</span>
                    <span class="invalidTitle">{{ errors.meetingTitle }}</span>
                </div>
                <input
                    type="text"
                    id="meetingTitle"
                    v-model="meetingTitle"
                    :placeholder="t('enterTitle')"
                    class="inputTitle longInput"
                />

                <div class="label-box">
                    <span class="label">{{ t("회의 기간") }}</span>
                </div>
                <div class="items-center">
                    <div class="periodSelectBox" @click="dropdown = !dropdown">
                        <select
                            class="selected-opt"
                            @change="handleChangePeriodType"
                            v-model="defaultPeriodType"
                        >
                            <button
                                class="memberBtn"
                            >
                                &#x25BC;
                            </button>
                            <option
                                v-for="(item, key) in MTG_periodOption"
                                :key="key"
                                :value="item.value"
                            >
                                {{ item.text }}
                            </option>
                        </select>
                    </div>
                </div>

                <div v-if="defaultPeriodType == ScheduleType.IMMEDIATE">
                    <div>
                        <span class="label-box">{{ t("회의 날짜") }}</span>
                        <div class="date-descript">{{ "오늘 날짜 자동 설정" }}</div>
                    </div>
                    <div>
                        <span class="label-box">{{ t("회의 시간") }}</span>
                        <div class="date-descript">{{ "회의 생성 후 2시간까지" }}</div>
                    </div>
                </div>
                <div v-else-if="defaultPeriodType == ScheduleType.ONE_DAY">
                    <div>
                        <span class="label-box">{{ t("회의 날짜") }}</span>
                        <div>
                            <VueDatePicker
                                locale="ko"
                                :dark="datePickerMode"
                                v-model="startDate"
                                format="yyyy-MM-dd"
                                class="customDate"
                                :cancel-text="t('취소')"
                                :select-text="t('확인')"
                                :placeholder="t('날짜를 선택해주세요')"
                                :disabled="defaultPeriodType == '0'"
                                :min-date="new Date()"
                                :max-date="endDate"
                                auto-apply
                            ></VueDatePicker>
                        </div>
                    </div>
                    <div>
                        <span class="label-box">{{ t("회의 시간") }}</span>
                        <div class="date-container">
                            <VueDatePicker
                                locale="ko"
                                :dark="datePickerMode"
                                v-model="startTime"
                                class="customTime"
                                time-picker
                                :is-24="false"
                                :cancel-text="t('취소')"
                                :select-text="t('확인')"
                                :placeholder="t('시작 시간')"
                                :disabled="defaultPeriodType == 0"
                                :hide-input-icon="true"
                                minutes-increment="30"
                            >
                                <template #am-pm-button="{ toggle, value }">
                                    <button @click="toggle">{{ value }}</button>
                                </template>
                            </VueDatePicker>
                            <VueDatePicker
                                locale="ko"
                                :dark="datePickerMode"
                                v-model="endTime"
                                class="customTime"
                                time-picker
                                :is-24="false"
                                :cancel-text="t('취소')"
                                :select-text="t('확인')"
                                :placeholder="t('종료 시간')"
                                :disabled="defaultPeriodType == 0"
                                :hide-input-icon="true"
                                minutes-increment="30"
                            >
                                <template #am-pm-button="{ toggle, value }">
                                    <button @click="toggle">{{ value }}</button>
                                </template>
                            </VueDatePicker>
                        </div>
                    </div>
                </div>
                <div v-else-if="defaultPeriodType == ScheduleType.DAILY">
                    <div>
                        <span class="label-box">{{ t("회의 시작일") }}</span>
                        <div class="date-container">
                            <VueDatePicker
                                locale="ko"
                                :dark="datePickerMode"
                                v-model="startDate"
                                format="yyyy-MM-dd"
                                class="customDate"
                                teleport
                                :cancel-text="t('취소')"
                                :select-text="t('확인')"
                                :placeholder="t('날짜 선택')"
                                :min-date="new Date()"
                                :max-date="endDate"
                                auto-apply
                            ></VueDatePicker>
                            <VueDatePicker
                                locale="ko"
                                :dark="datePickerMode"
                                v-model="startTime"
                                time-picker
                                teleport
                                :is-24="false"
                                :cancel-text="t('취소')"
                                :select-text="t('확인')"
                                :placeholder="t('시작 시간')"
                                :hide-input-icon="true"
                                minutes-increment="30"
                                class="customTime col"
                            >
                                <template #am-pm-button="{ toggle, value }">
                                    <button @click="toggle">{{ value }}</button>
                                </template>
                            </VueDatePicker>
                        </div>
                    </div>
                    <div>
                        <span class="label-box">{{ t("회의 종료일") }}</span>
                        <div class="date-container">
                            <VueDatePicker
                                locale="ko"
                                :dark="datePickerMode"
                                v-model="endDate"
                                format="yyyy-MM-dd"
                                class="customDate"
                                teleport
                                :cancel-text="t('취소')"
                                :select-text="t('확인')"
                                :placeholder="t('날짜 선택')"
                                :min-date="startDate"
                                auto-apply
                            ></VueDatePicker>
                            <VueDatePicker
                                locale="ko"
                                :dark="datePickerMode"
                                v-model="endTime"
                                teleport
                                class="customTime col"
                                time-picker
                                :is-24="false"
                                :cancel-text="t('취소')"
                                :select-text="t('확인')"
                                :placeholder="t('종료 시간')"
                                :hide-input-icon="true"
                                minutes-increment="30"
                            >
                                <template #am-pm-button="{ toggle, value }">
                                    <button @click="toggle">{{ value }}</button>
                                </template>
                            </VueDatePicker>
                        </div>
                    </div>
                </div>
                <div v-else-if="defaultPeriodType == ScheduleType.ALWAYS">
                    <div>
                        <span class="label-box">{{ t("회의 시작일") }}</span>
                        <div class="date-container">
                            <VueDatePicker
                                locale="ko"
                                :dark="datePickerMode"
                                v-model="startDate"
                                format="yyyy-MM-dd"
                                class="customDate"
                                teleport
                                :cancel-text="t('취소')"
                                :select-text="t('확인')"
                                :placeholder="t('날짜 선택')"
                                :min-date="new Date()"
                                :max-date="endDate"
                                auto-apply
                            ></VueDatePicker>
                            <VueDatePicker
                                locale="ko"
                                :dark="datePickerMode"
                                v-model="startTime"
                                format="HH:mm"
                                time-picker
                                teleport
                                :is-24="false"
                                :cancel-text="t('취소')"
                                :select-text="t('확인')"
                                :placeholder="t('시작 시간')"
                                :hide-input-icon="true"
                                minutes-increment="30"
                                class="customTime col"
                            >
                                <template #am-pm-button="{ toggle, value }">
                                    <button @click="toggle">{{ value }}</button>
                                </template>
                            </VueDatePicker>
                        </div>
                    </div>
                    <div>
                        <span class="label-box">{{ t("회의 종료일") }}</span>
                        <div class="date-descript">{{ "회의 삭제 시 까지 유지" }}</div>
                    </div>
                </div>
                <div
                    class="justify-between"
                    v-if="
                        defaultPeriodType == ScheduleType.ALWAYS &&
                        preprenceStore.useDirectCall
                    "
                >
                    <div class="items-center">
                        <div class="label-box">{{ t("추가 기능") }}</div>
                        <div class="optionBox">
                            <div class="optionBox__input">
                                <input
                                    type="checkbox"
                                    v-model="checkEntryNotification"
                                    value="true"
                                />
                                <span>{{ t("사용") }}</span>
                            </div>
                            <div class="optionBox__txt">
                                <span>{{ t("회의 초대 알림 발송") }}</span>
                            </div>
                        </div>
                        <div class="optionBox">
                            <div class="optionBox__input">
                                <input
                                    type="checkbox"
                                    v-model="checkDirectCall"
                                    value="true"
                                />
                                <span>{{ t("사용") }}</span>
                            </div>
                            <div class="optionBox__txt">
                                <span>{{ t("스마트글라스 다이렉트콜 입장") }}</span>
                            </div>
                        </div>
                        <div class="optionBox">
                            <div class="optionBox__input">
                                <input
                                    type="checkbox"
                                    v-model="checkEveryoneStart"
                                    value="true"
                                />
                                <span>{{ t("사용") }}</span>
                            </div>
                            <div class="optionBox__txt">
                                <span>{{ t("누구나 회의 시작 가능") }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="label-box">{{ t("meetingMember") }}</span>
                <div>
                    <div class="selected-opt">
                        <div
                            class="memberInput"
                            @click="memberClick"
                            contenteditable="false"
                            id="meetingMember"
                            :placeholder="t('chooseMember')"
                            readonly
                        >
                            <span
                                class="membersValue"
                                v-for="(memberValue, memberValuesKey) in selectedMember"
                                :key="memberValuesKey"
                                >{{
                                    `${memberValue}${memberValuesKey !== selectedMember.length - 1 ? "," : ""}`
                                }}</span
                            >
                        </div>
                        <button class="memberBtn" v-if="!openMember" @click="memberClick">
                            &#x25BC;
                        </button>
                        <button
                            class="memberBtn"
                            v-if="openMember"
                            @click="memberClick"
                        >
                            &#x25BC;
                        </button>
                    </div>

                    <div class="memberBox" v-if="openMember">
                        <MeetingMember
                            @value="memberUpdate"
                            @selectMember="selectMember"
                            :enterMember="meetingMember"
                            :selectedMemberIds="selectedMemberIds"
                        ></MeetingMember>
                    </div>
                    <button
                        @click="memberSubmitBtn"
                        v-if="openMember"
                        class="justify-center items-center okBtn"
                    >
                        <span>{{ t("memberOK") }}</span>
                    </button>
                </div>

                <div class="row justify-center">
                    <button
                        class="showMoreOptionBtn"
                        v-if="!showMoreOptions"
                        @click="showMoreOptions = true"
                    >
                        + {{ t("참여자 추가") }}
                    </button>
                </div>

                <span class="label-box" v-if="showMoreOptions">{{
                    t("meetingGuest")
                }}</span>
                <div class="column column-gap10" v-if="showMoreOptions">
                    <div class="form-box">
                        <input
                            type="text"
                            id="emailID"
                            v-model="email"
                            :placeholder="t('이메일 입력')"
                            @keyup.enter="guestEmailAdd"
                            class="emailInput first"
                        />
                        <!-- <input
                            type="text"
                            id="emailAddress"
                            v-model="emailAddress"
                            placeholder="wattsolution.co.kr"
                            @keyup.enter="guestEmailAdd"
                            class="emailInput second"
                        /> -->
                        <button @click="guestEmailAdd" class="addBtn">
                            {{ t("guestAdd") }}
                        </button>
                    </div>
                    <div>
                        <span
                            class=" emailInput third row items-center"
                            contenteditable="false"
                            id="email"
                            :placeholder="t('addEmail')"
                            readonly
                        >
                            <div
                                v-for="email in emails"
                                :key="email.fullEmail"
                                :id="email.emailNum"
                                class="email-box"
                            >
                                <span>{{ email.fullEmail }}</span>
                                <button @click="guestEmailDelete(email.emailNum)">
                                    <img
                                        @click="guestEmailDelete(email.emailNum)"
                                        src="@/assets/images/conference/ic_email.png"
                                    />
                                </button>
                            </div>
                        </span>
                    </div>

                    <span class="label row items-center" v-if="showCctv">CCTV</span>
                    <div style="min-width: 334px" v-if="showCctv">
                        <input
                            type="text"
                            id="cctvName"
                            v-model="cctvName"
                            :placeholder="t('cctvs')[1]"
                            class="cctvInput first"
                        />
                        <input
                            type="text"
                            id="cctvUrl"
                            v-model="cctvUrl"
                            placeholder="CCTV URL *"
                            class="cctvInput second"
                        />
                        <button @click="addCCTV" class="addBtn">
                            {{ t("guestAdd") }}
                        </button>
                    </div>
                    <div v-if="showCctv">
                        <span
                            class="cctvInput third row items-center"
                            contenteditable="false"
                            id="cctv"
                            placeholder="cctv"
                            readonly
                        >
                            <div
                                class="cctvComponent"
                                v-for="(cctv, index) in cctvs"
                                :key="index"
                            >
                                <span class="cctvContent"
                                    >{{ cctv.name }} &gt; &nbsp; {{ cctv.url }}</span
                                >
                                <button @click="deleteCctv(index)">
                                    <img src="@/assets/images/conference/ic_email.png" />
                                </button>
                            </div>
                        </span>
                    </div>
                </div>

                <div class="button-box">
                    <button @click="saveMeeting" v-if="!compData" class="saveBtn">
                        {{ t("save") }}
                    </button>
                    <button @click="modifyMeeting" v-if="compData" class="saveBtn">
                        {{ t("save") }}
                    </button>
                    <button @click="close" class="cancelBtn">{{ t("cancel") }}</button>
                </div>
            </div>
        </div>
    </VueFinalModal>
</template>

<script setup>
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { string, object, number, date, boolean, array, mixed } from "yup";
import { commonToastMessage } from "@/composables/common";
import { useMeetingStore } from "@/stores/meeting";
import { useCallStore } from "@/stores/call";
import { useLoginStore } from "@/stores/login";
import { getCookie } from "@/utils/common";
import { useForm } from "vee-validate";
import { VueFinalModal } from "vue-final-modal";
import MeetingMember from "@/components/pages/meeting/MeetingMember.vue";
import { useUserListStore } from "@/stores/userList";
import { userListGetEmail } from "@/utils/userList";
import { useUserPreferenceStore } from "@/stores/common";
import { watch } from "vue";

const ScheduleType = {
    IMMEDIATE: 0,
    ONE_DAY: 1,
    DAILY: 2,
    ALWAYS: 3,
};

const { t } = useI18n();
const meetingStore = useMeetingStore();
const callStore = useCallStore();
const loginStore = useLoginStore();
const userListStore = useUserListStore();
const preprenceStore = useUserPreferenceStore();

const type = ref("0");
const idNum = ref(0);
const today = ref("");
const currentTime = ref("");
const minEndTime = ref("");
const meetingTitle = ref("");
const title = ref("");
const startDate = ref(null);
const startTime = ref(null);
const endTime = ref(null);
const endDate = ref(null);
const edit = ref(false);
const meetingMember = ref([]);
const member_deviceid = ref([]);
const emailID = ref("");
const emailAddress = ref("");
const email = ref("");
const modify = ref("");
const openMember = ref(false);
const dropdown = ref(false);
const typeChangeState = ref(false);
const datePickerMode = ref("dark");

const MTG_periodOption = ref([
    { text: t("즉시"), value: ScheduleType.IMMEDIATE },
    { text: t("1일"), value: ScheduleType.ONE_DAY },
    { text: t("연일"), value: ScheduleType.DAILY },
    { text: t("상시"), value: ScheduleType.ALWAYS },
]);

const defaultPeriodType = ref(0);
const disabledState = ref(true);
const checkStartDate = ref("");
const checkEndDate = ref("");
const checkStartTime = ref("");
const checkEndTime = ref("");
const checkEntryNotification = ref(0);
const checkDirectCall = ref(0);
const checkEveryoneStart = ref(0);
const checkAppDirectCallTF = ref(undefined);
const cctvName = ref("");
const cctvUrl = ref("");
const cctvs = ref([]);
const showCctv = ref(false);
const showMoreOptions = ref(false);
const userList = reactive([]);
const selectedMember = ref([]);
const selectedMemberIds = ref([]);
const isDataLoaded = ref(false);

// Yup 스키마로 유효성 검사 규칙 정의
const validationSchema = object({
    meetingTitle: string().required("@"), // 값이 입력되었는지 확인
    defaultPeriodType: string().required("@"), // 값이 입력되었는지 확인
    startDate: string().required("@"),
    startTime: string().required("@"),
    endDate: string().required("@"),
    endTime: string().required("@"),
});

const { errors, handleSubmit, defineInputBinds, setFieldValue } = useForm({
    validationSchema,
    initialValues: {
        meetingTitle: "",
        defaultPeriodType: 0,
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
    },
});
const props = defineProps({
    compData: Object,
    index: Number,
    allView: Boolean,
});

const emit = defineEmits(["close"]);

onMounted(() => {
    showCctv.value = getCookie("showCctv") ? getCookie("showCctv") : false;

    meetingStore.saveBtnClick(true);
    console.log("*** mounted: 회의 생성 모달 실행");

    const date = new Date();
    const year = date.getFullYear();
    const month = leadZero(date.getMonth() + 1);
    const day = leadZero(date.getDate());
    const full = `${year}-${month}-${day}`;
    today.value = full;

    let hour = date.getHours();
    let minute = date.getMinutes();

    // 회의 시작 최소 시간 설정
    if (minute < 30) {
        if (hour < 10) {
            hour = "0" + hour;
        }
        currentTime.value = `${hour}:30`;
    } else {
        hour = Number(hour) + 1;
        if (hour < 10) {
            hour = "0" + hour;
        }
        if (hour > 24) {
            // Handles midnight rollover (e.g., 23:30 becomes 00:00+ next day, if you want 01:00)
            hour = "01"; // Or "00" depending on exact next hour logic
        }
        currentTime.value = `${hour}:00`;
    }

    const startDateElement = document.getElementById("startDate");
    if (startDateElement) {
        startDateElement.setAttribute("min", full);
    }

    // Logic for 'compData' (editing mode)
    if (props.compData) {
        console.log(props.compData, "===============================");
        edit.value = true;
        meetingTitle.value = props.compData.customData.title;
        defaultPeriodType.value = props.compData.customData.type;

        checkDirectCall.value = props.compData.customData.direct_call_yn == 1;
        checkEveryoneStart.value = props.compData.customData.everyone_start_yn == 1;
        checkEntryNotification.value =
            props.compData.customData.entry_notification_yn == 1;

        // Filter MTG_periodOption
        const pe = MTG_periodOption.value.filter((ele) => {
            return ele.value == props.compData.customData.type;
        });

        if (
            props.compData.customData.cctv_list &&
            props.compData.customData.cctv_list.length > 0
        ) {
            // Use spread operator or map to create a new array for reactivity if needed,
            // or directly assign if cctv_list itself is an array of objects
            cctvs.value = [...props.compData.customData.cctv_list];
        }

        const mtgPeriodTag = document.getElementById("mtgPeriod");
        if (mtgPeriodTag) {
            mtgPeriodTag.style.color = "#ffffff";
        }
        defaultPeriodType.value = pe[0].value;
        console.log(defaultPeriodType.value);

        console.log("*** mounted: this.compData.dates = ", props.compData.dates);
        let mtgStartDate = props.compData.startDate.replace(/\./g, "-"); // Use regex for global replace
        let mtgEndDate = props.compData.endDate.replace(/\./g, "-");
        const timeRange = props.compData.customData.time.split(",");
        const mtgStartTime = timeRange[0].split(":");
        const ntgEndTime = timeRange[1].split(":");

        startDate.value = mtgStartDate;
        startTime.value = { hours: mtgStartTime[0], minutes: mtgStartTime[1] };

        if (defaultPeriodType.value == 3) {
            endTime.value = t("meeting validity period"); // Use t for translation
        } else {
            endDate.value = mtgEndDate;
            endTime.value =  { hours: ntgEndTime[0], minutes: ntgEndTime[1] };
        }
        console.log(startDate.value, endDate.value, startTime.value, endTime.value);

        console.log(
            "*** mounted: this.compData.customData.member = ",
            props.compData.customData.member,
        );
        const memberStr = props.compData.customData.member;
        console.log("*** mounted: memberStr = ", memberStr);
        let memberSplit = memberStr.split(", "); // Use let as it's modified
        const membersDeviceId = [...props.compData.customData.member_deviceid];

        console.log("*** mounted: memberSplit = ", memberSplit);
        console.log("*** mounted: membersDeviceId = ", membersDeviceId);

        // Filter out current user's device ID and nickname
        const myDeviceId = sessionStorage.getItem("m_local_deviceid");
        const myNickname = sessionStorage.getItem("m_nickname");

        const filteredMembersDeviceId = membersDeviceId.filter((id) => id !== loginStore.m_local_deviceid);
        const filteredMemberSplit = memberSplit.filter((name) => name !== loginStore.nickname);

        member_deviceid.value = filteredMembersDeviceId;
        meetingMember.value = filteredMemberSplit;

        console.log("여기 확인 해줘", member_deviceid.value, meetingMember.value);

        const exptext = /^[A-Za-z0-9_\\.\\-]+@[A-Za-z0-9\\-]+\.[A-Za-z0-9\\-]+/;
        let emailNum = 0;
        // Iterate backwards when modifying an array during iteration
        for (let i = meetingMember.value.length - 1; i >= 0; i--) {
            if (exptext.test(meetingMember.value[i])) {
                const [fullEmail] = meetingMember.value.splice(i, 1);
                const spliceEmail = {
                    fullEmail: fullEmail,
                    emailNum: emailNum++,
                };
                meetingStore.emailAdd(spliceEmail);
                if (member_deviceid.value[i]) {
                    // Check if index exists before splicing
                    member_deviceid.value.splice(i, 1);
                }
            }
        }

        if (member_deviceid.value.length > 0) {
            member_deviceid.value.forEach((id) => {
                meetingStore.meetingMemberIdAdd(id);
                selectedMemberIds.value.push(id);
            });
        }
        if (meetingMember.value.length > 0) {
            meetingMember.value.forEach((name) => {
                meetingStore.meetingMemberIdAdd(name);
                selectedMember.value.push(name);
            });
        }
    }
        defaultPeriodType.value = 0;
        let memberList = [];
        memberList[0] = {
            name: loginStore.institution,
            children: userListStore.organizationList,
        };
        meetingMember.value = memberList;
});

function disabledDate(date) {
    const today = new Date();
    return date < today.setHours(0, 0, 0, 0); // 오늘보다 이전 날짜는 선택 불가
}
const leadZero = (value) => {
    return String(value).padStart(2, "0");
};

// Extract time (moved from methods)
const extractTime = (time, type) => {
    const utcDate = new Date(time);
    const hour = leadZero(utcDate.getHours());
    const minutes = leadZero(utcDate.getMinutes());
    return `${hour}:${minutes}`;
};

// Extract date (moved from methods)
const extractDate = (date, type) => {
    const utcDate = new Date(date);
    const year = utcDate.getFullYear();
    const month = leadZero(utcDate.getMonth() + 1);
    const day = leadZero(utcDate.getDate());
    return `${year}-${month}-${day}`;
};

// Date format conversion (moved from methods)
const dateFormatConversion = (splitDate) => {
    const year = splitDate[0];
    let month = splitDate[1];
    let date = Number(splitDate[2]);

    month = leadZero(month);
    date = leadZero(date);
    return `${year}-${month}-${date}`;
};

// --- Methods (functions in Composition API) ---

const handleChangePeriodType = (e) => {
    defaultPeriodType.value = e.target.value;
    const mtgPeriodTag = document.getElementById("mtgPeriod");
    if (mtgPeriodTag) {
        // Check if element exists before manipulating style
        mtgPeriodTag.style.color = "#ffffff";
    }
    typeChangeState.value = true;
    // startDate.value = "";
    // endDate.value = "";
    // startTime.value = "";
    // endTime.value = "";
};

const close = () => {
    emit("close");
    meetingStore.setMeetingSeq(null); // Use injected $store
};

const guestEmailAdd = () => {
    // const a = emailID.value;
    // let b = emailAddress.value;

    // if (a === "" || (a === "" && b === "")) {
    //     return;
    // } else if (b === "") {
    //     b = "wattsolution.co.kr";
    // }

    const c = {
        fullEmail: email.value,
        emailNum: idNum.value,
    };

    // Assuming userListGetEmail is a globally injected method
    console.log(c.fullEmail);
    const checkEmail = userListGetEmail(c.fullEmail);

    console.log(checkEmail);
    // 자신 이메일 체크
    if (checkEmail === -1) {
        if (c.fullEmail === loginStore.sessionEmail) {
            // Assuming commonToastMessage is a globally injected method
            console.log("나의 이메일이야");
            commonToastMessage(t("toastMessage myselfEmailCheck"));
            email.value = ""
            return;
        }

        // 비회원 등록
        meetingStore.emailAdd(c);
        email.value = "";
        idNum.value++;
    } else {
        // Check if userData is available (e.g., a prop or another ref/computed property)
        // For now, assuming userData is available in scope, e.g., via a prop or Vuex state
        const userData = callStore.userData; // Example: assuming it's in Vuex state

        if (!userData) {
            console.warn("userData is not available for guestEmailAdd method.");
            return;
        }

        for (let i = 0; i < userData.length; i++) {
            if (userData[i].deviceid === checkEmail && userData[i].devicetype !== 4) {
                for (let j = 0; j < meetingMember.value.length; j++) {
                    if (meetingMember.value[j] === userData[i].nickname) {
                        commonToastMessage(`${t("toastMessage emailDuplicate")}`);
                        return;
                    }
                }
                if (loginStore.lang === "ko") {
                    commonToastMessage(
                        `${userData[i].nickname}${t("toastMessage emailCheck")}`,
                    );
                } else {
                    commonToastMessage(
                        `${t("toastMessage emailCheck")}${userData[i].nickname} ${t("toastMessage emailCheck2")}`,
                    );
                }
                meetingMember.value.push(userData[i].nickname);
                meetingStore.meetingMemberIdAdd(checkEmail);
                meetingStore.meetingMemberEmailAdd(c.fullEmail);
                selectedMember.value.push(userData[i].nickname);
                selectedMemberIds.value.push(userData[i].deviceid);
                email.value = "";
            }
        }
    }
};

const guestEmailDelete = (e) => {
    meetingStore.emailDelete(e);
};

const addCCTV = () => {
    if (cctvName.value === "") return alert(t("cctvs")[2]);
    if (cctvUrl.value === "") return alert(t("cctvs")[3]);
    if (!cctvUrl.value.includes("http")) return alert(t("cctvs")[4]);

    const cctvParms = {
        name: cctvName.value,
        url: cctvUrl.value,
    };

    cctvs.value.push(cctvParms);
    cctvName.value = "";
    cctvUrl.value = "";
};

const deleteCctv = (index) => {
    cctvs.value.splice(index, 1);
};

const saveMeeting = async (modifyOnOff) => {
    let entryNotificationYN = checkEntryNotification.value ? 1 : 0;
    let directCallYN = checkDirectCall.value ? 1 : 0;
    let everyoneStartYN = checkEveryoneStart.value ? 1 : 0;

    function formatToKoreanDate(date) {
        const dateObject = new Date(date);

        // 날짜와 관련된 정보 추출
        const year = dateObject.getFullYear(); // 2025
        const month = dateObject.getMonth() + 1; // 8 (월은 0부터 시작하므로 +1)
        const day = dateObject.getDate();
        return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    }
    function formatToKoreanTime(value) {
        console.log(typeof value, value)
        if (typeof value === "String" && value.includes("T")) {
            const date = new Date(value);

            // ✅ 한국 시간 기준
            const hh = String(date.getHours()).padStart(2, "0");
            const mm = String(date.getMinutes()).padStart(2, "0");
            return `${hh}:${mm}`;
        } else if (value && typeof value === "object") {
            const hh = String(value.hours).padStart(2, "0");
            const mm = String(value.minutes).padStart(2, "0");
            return `${hh}:${mm}`;
        }

        // 단순 시간 "HH:mm" 형태일 경우 그대로 리턴
        return value
    }

    const titleVal = meetingTitle.value;
    console.log(`변환하기전, ${startDate.value}, ${endDate.value}, ${startTime.value}, ${endTime.value}`)
    let currentStartDate = formatToKoreanDate(startDate.value);
    let currentEndDate = formatToKoreanDate(endDate.value);
    let currentStartTime = formatToKoreanTime(startTime.value);
    let currentEndTime = formatToKoreanTime(endTime.value);
    let currentType = defaultPeriodType.value; // Use current value of type ref

    let date = new Date();
    const yyyy = date.getFullYear();
    const MM = date.getMonth() + 1;
    const dd = date.getDate();
    const hh = date.getHours();
    const mm = date.getMinutes();

    currentType = String(currentType);

    console.log("meeting period type:", currentType);
    const formatNumber = (num) => String(num).padStart(2, "0");
    // 회의기간타입이 0일 경우
    if (currentType == 0) {
        currentStartDate = `${yyyy}-${formatNumber(MM)}-${formatNumber(dd)}`;
        currentEndDate = `${yyyy}-${formatNumber(MM)}-${formatNumber(dd)}`;
        currentStartTime = `${hh}:${mm}`;
        currentEndTime = `${hh + 2}:${mm}`;
    } else if (currentType == 1) {
        // 회의기간타입이 1일(1) 일경우 >> 시작날짜 == 종료날짜
        currentEndDate = currentStartDate;
    } else if (currentType == 3) {
        // 회의기간타입이 상시(3) 종료일을 임의로 2100년으로 설정
        currentEndDate = "2100-01-01";
        currentEndTime = "00:00";
    }
    console.log(
        "startDate:",
        currentStartDate,
        ", endDate:",
        currentEndDate,
        ", startTime:",
        currentStartTime,
        ", endTime:",
        currentEndTime,
    );

    const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);
    const isValidTime = (time) => /^\d{2}:\d{2}$/.test(time);

    if (defaultPeriodType.value == ScheduleType.ONE_DAY) {
        if (!isValidDate(currentStartDate) ||!isValidTime(currentStartTime) ||  !isValidTime(currentEndTime)) {
            console.error("❌ 잘못된 startDate:", currentStartDate, currentStartTime, currentEndTime);
            commonToastMessage(t("회의 날짜, 회의 시간을 모두 입력해주세요"))
            return
        }
    } else if (defaultPeriodType.value == ScheduleType.DAILY) {
        if (!isValidDate(currentStartDate) || !isValidDate(currentEndDate) ||!isValidTime(currentStartTime) ||  !isValidTime(currentEndTime)) {
            console.error("❌ 잘못된 startDate:", currentStartDate, currentEndDate, currentStartTime, currentEndTime);
            commonToastMessage(t("회의 시작일, 회의 종료일의 (날짜, 시간)을 모두 입력해주세요"))
            return
        }
    } else if (defaultPeriodType.value == ScheduleType.ALWAYS) {
        if (!isValidDate(currentStartDate) || !isValidTime(currentStartTime)) {
            console.error("❌ 잘못된 startDate:", currentStartDate, currentStartTime);
            commonToastMessage(t("회의 시작일 (날짜, 시간)을 입력해주세요"))
            return
        }
    }

    let member = [];
    let memberId = [];
    let memberEmail = [];

    member.push(...selectedMember.value);
    memberId.push(...selectedMemberIds.value);
    memberEmail = callStore.userData
        .filter(user => selectedMemberIds.value.includes(user.deviceid))
        .map(user => user.email);

    // 본인 추가
    if (member.length === 0) {
        // Check length for array
        member.push(loginStore.nickname);
        memberId.push(loginStore.m_local_deviceid);
        memberEmail.push(loginStore.sessionEmail);
    } else {
        member.unshift(loginStore.nickname);
        memberId.unshift(loginStore.m_local_deviceid);
        memberEmail.unshift(loginStore.sessionEmail);
    }

    const guestEmail = [];
    const exptext = /^[A-Za-z0-9_\\.\\-]+@[A-Za-z0-9\\-]+\.[A-Za-z0-9\\-]+/;

    // Assuming 'emails' is a reactive ref from the data section (e.g., `const emails = ref([])`)
    for (let i = 0; i < emails.value.length; i++) {
        guestEmail.push(emails.value[i].fullEmail);
    }

    if (props.compData) {
        for (let i = 0; i < memberId.length; i++) {
            if (exptext.test(memberId[i]) === true) {
                guestEmail.push(memberId.splice(i, 1)[0]);
                member.splice(i, 1);
            }
        }
    }
    let cctvList = [];
    if (cctvs.value.length > 0) {
        cctvList = cctvs.value;
    }

    defaultPeriodType.value = currentType; // Re-assigning to ref is fine, though already `currentType`

    const meetingInfo = {
        title: meetingTitle.value, // Use the extracted title
        startDate: currentStartDate,
        startTime: currentStartTime,
        endDate: currentEndDate,
        endTime: currentEndTime,
        type: currentType,
        maker: loginStore.m_local_deviceid,
        members: member,
        memberIDs: memberId,
        memberEmails: memberEmail,
        guestEmails: guestEmail,
        entry_notification_yn: entryNotificationYN,
        direct_call_yn: directCallYN,
        everyone_start_yn: everyoneStartYN,
        cctv_list: cctvList,
    };

    console.log(meetingInfo);
    // return meetingInfo;
    console.log("*******************meetineInfo 유효성 검사후*******************");
    console.log("*** methods: saveMeeting:: meetingInfo = ", meetingInfo);

    if (modifyOnOff === true) {
        console.log("*** methods: saveMeeting:: 회의를 수정합니다.");
        console.log("*** methods: saveMeeting:: " + modifyOnOff);
        console.log("*** methods: saveMeeting:: " + meetingInfo, "meetingInfo");
        meetingStore.setMeetingModifyInfo(meetingInfo);
        meetingStore.setMeetingModifyFlag(true);
    } else {
        meetingStore.setMeetingSaveInfo(meetingInfo);
        meetingStore.setMeetingSaveFlag(true);
    }

    meetingStore.meetingMemberDeleteAll();
    meetingStore.meetingMemberIdAllDelete();
    meetingStore.meetingMemberEmailDeleteAll();
    meetingStore.emailDeleteAll();
    meetingStore.saveBtnClick(false);
    emit('close')
};

const modifyMeeting = () => {
    saveMeeting(true);
};

const memberClick = () => {
    openMember.value = !openMember.value;
    if (openMember.value === true) {
        // // The original code was commented out here. Keeping it that way.
        // meetingMember.value = []
        // meetingStore.meetingMemberIdAllDelete")
        // meetingStore.meetingMemberDeleteAll")
    } else {
        const mm = meetingMember.value;
        if (mm.length > 0) {
            // Check array length
            meetingStore.meetingMemberAdd(mm);
        }
    }
};

const memberUpdate = (value) => {
    console.log(value);
    meetingMember.value = value;
};

const selectMember = (obj) => {
    selectedMember.value = obj.names;
    selectedMemberIds.value = obj.deviceIds;
};
const memberSubmitBtn = () => {
    const mm = meetingMember.value;
    meetingStore.meetingMemberAdd(mm);
    openMember.value = !openMember.value;
};
const emails = computed(() => meetingStore.emails);
const isBtnClick = computed(() => meetingStore.btnClick);
const userData = computed(() => store.state.call.userData);

watch(type, (newVal, oldVal) => {
    // 회의기간 타입이 변경될경우 날짜, 시간 설정값을 초기화한다.
    if (defaultPeriodType.value) {
        // Access ref with .value
        console.log("변경");
        // startDate.value = "";
        // startTime.value = "";
        // endDate.value = "";
        // endTime.value = "";
        typeChangeState.value = false; // Reset the state after handling
    }
    console.log("*** watch: type --> before Value", oldVal);
    console.log("*** watch: type --> current Value", newVal);

    if (newVal === 0 || newVal === 3) {
        disabledState.value = true;
    } else {
        disabledState.value = false;
    }
});
watch(startTime,
    (value) => {
        console.log("changed or initial:", value);

        // if (value == ScheduleType.IMMEDIATE) {
        //     startDate.value = "";
        //     endDate.value = "";
        //     startTime.value = "";
        //     endTime.value = "";
        // } else if (value == ScheduleType.ONE_DAY) {
        //     startDate.value = "";
        //     endDate.value = "";
        //     startTime.value = "";
        //     endTime.value = "";
        // } else if (value == ScheduleType.DAILY) {
        //     startDate.value = "";
        //     endDate.value = "";
        //     startTime.value = "";
        //     endTime.value = "";
        // } else if (value == ScheduleType.ALWAYS) {
        //     startDate.value = "";
        //     endDate.value = "";
        //     startTime.value = "";
        //     endTime.value = "";
        // }
    },
    { immediate: true });

watch(
    defaultPeriodType,
    (value) => {
        console.log("changed or initial:", value);

        // if (value == ScheduleType.IMMEDIATE) {
        //     startDate.value = "";
        //     endDate.value = "";
        //     startTime.value = "";
        //     endTime.value = "";
        // } else if (value == ScheduleType.ONE_DAY) {
        //     startDate.value = "";
        //     endDate.value = "";
        //     startTime.value = "";
        //     endTime.value = "";
        // } else if (value == ScheduleType.DAILY) {
        //     startDate.value = "";
        //     endDate.value = "";
        //     startTime.value = "";
        //     endTime.value = "";
        // } else if (value == ScheduleType.ALWAYS) {
        //     startDate.value = "";
        //     endDate.value = "";
        //     startTime.value = "";
        //     endTime.value = "";
        // }
    },
    { immediate: true },
);
</script>
<style lang="scss" scoped>
input,
select,
.emailInput {
    background: #323232 0 0 no-repeat padding-box;
    border: none;
    width: 100%;
    color: #fff;
}

.makeMain {
    overflow-x: hidden;
    background-color: #262627;
    border: 1px solid #1d1d1d;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.45098);
}

.invalidTitle {
    display: flex;
    margin-left: 7px;
    margin-top: 2px;
    font: normal normal bold 14px/16px NanumSquare;
}

.invalidDate {
    display: flex;
    align-items: center;
    margin-left: 7px;
    font: normal normal bold 14px/16px NanumSquare;
}

.label-box {
    margin-top: 20px;
    margin-bottom: 10px;
    color: #fff;
}

.invalidStartTime {
    position: absolute;
    left: 57px;
    top: -31px;
    font: normal normal normal 14px/16px NanumSquare;
}

.invalidEndTime {
    position: absolute;
    left: 57px;
    top: -30px;
    font: normal normal normal 14px/16px NanumSquare;
}

.titleLine {
    height: 73px;
    display: flex;
    align-items: end;
    justify-content: space-between;
    border-bottom: 2px solid #343434;
    > .modalFont22 {
        margin-bottom: 12px;
    }
}

.cancelBtn {
    width: 85px;
    height: 32px;
    border-radius: 20px;
    z-index: 1;
    background-color: #464646;
    color: #fff;
}

.saveBtn,
.addBtn {
    width: 85px;
    height: 32px;
    border-radius: 20px;
    z-index: 1;
    background-color: #1c8eff;
    color: #fff;
}

.inputBox {
    .inputTitle {
        height: 40px;
    }

    input[type="date"] {
        height: 40px;
        padding-left: 13px;
        padding-top: 12px;
        padding-bottom: 12px;

        &::-webkit-calendar-picker-indicator {
            background: none;
            z-index: 1;
            cursor: pointer;
            opacity: 0;
        }

        &::before {
            content: "\25BC";
            display: block;
            background: transparent;
            width: 13px;
            height: 11px;
            position: absolute;
            top: 12px;
            right: 6px;
            z-index: -1;
        }

        &::-webkit-clear-button {
            //display: none; // Original was commented out
        }
    }

    input[type="time"] {
        width: 165px;
        height: 40px;
        padding-left: 13px;
        padding-top: 12px;
        padding-bottom: 12px;
        margin-bottom: 26px;

        &::-webkit-calendar-picker-indicator {
            color: transparent;
            background: none;
            z-index: 1;
            cursor: pointer;
            opacity: 0;
        }

        &::before {
            content: "\25BC";
            display: block;
            background: transparent;
            width: 13px;
            height: 11px;
            position: absolute;
            top: 11px;
            right: 6px;
            z-index: -1;
        }
    }

    .soon {
        input[type="checkbox"] {
            display: none;

            + label {
                display: inline-block;
                position: relative;
                cursor: pointer;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;

                &::before {
                    content: " ";
                    display: inline-block;
                    width: 14px;
                    height: 14px;
                    line-height: 14px;
                    text-align: center;
                    vertical-align: middle;
                    margin-right: 8px;
                }

                &:active::before,
                input[type="checkbox"]:checked + &::active::before {
                    box-shadow:
                        0 1px 2px rgba(0, 0, 0, 0.05),
                        inset 0px 1px 3px rgba(0, 0, 0, 0.1);
                }
            }
        }

        input[type="checkbox"]:checked + label {
            &::before {
                content: "\2714";
            }
        }

        padding-bottom: 12px;
    }
}

.periodSelectBox {
    font: normal normal normal 14px/16px NanumSquare;
    cursor: pointer;
    background-color: #000;

    > span {
        padding: 10px;

        > button {
            float: right;
        }
    }

    > div {
        padding: 10px;
    }
}

.longInput {
    padding-left: 13px;
    padding-top: 12px;
    padding-bottom: 12px;
    font: normal normal normal 14px/16px NanumSquare;
}

.memberInput {
    width: 90%;
    font: normal normal normal 14px/16px NanumSquare;
    color: #fff;
    &::placeholder {
        color: #a1a1a1;
    }
    &:empty::before {
        color: #a1a1a1;
        content: attr(placeholder);
        font: normal normal normal 14px/16px NanumSquare;
    }
}

.memberBtn {
    color: #8c8c8c;
    position: absolute;
    right: 5px;
}

.memberBox {
    height: 316px;
    font: normal normal bold 14px/16px NanumSquare;
    //overflow-x: auto; // Original was commented out
    z-index: 2;

    @media all and (max-width: 767px) {
        height: 171px;
    }
}

.membersValue {
    font: normal normal normal 14px/16px NanumSquare;
}

.okBtn {
    width: 100% !important;
    height: 42px !important;
    position: absolute;
    bottom: -289px;
    font: normal normal bold 14px/16px NanumSquare;
    letter-spacing: 0px;
    z-index: 4;

    span {
        padding-bottom: 0px;
    }

    @media all and (max-width: 767px) {
        bottom: -187px;
    }
}

.emailInput {
    padding: 13px;
    &.second {
        width: 136px;
        height: 40px;
        
    }

    &.third {
        width: 344px;
        font: normal normal normal 14px/16px NanumSquare;
        overflow-x: auto;
        color: #fff;
        background: #323232 0 0 no-repeat padding-box;
        padding: 7px;
        font-size: 15px;

        &:empty::before {
            color: #a1a1a1;
            content: attr(placeholder);
            font: normal normal normal 14px/16px NanumSquare;
        }

        &:hover:empty {
            position: relative;
            height: 42px;
        }

        &:hover {
            position: relative;
            top: 0;
            overflow: visible;
            -ms-word-break: break-all;
            word-break: break-all;
            word-break: break-word;
            -webkit-hyphens: auto;
            -moz-hyphens: auto;
            hyphens: auto;
            height: max-content;
            min-height: 35px;
            max-height: 120px;
            overflow-x: auto;
            z-index: 2;
        }
    }

    .email-box {
        display: flex;
        align-items: center;
        > button {
            display: inherit;
        }
    }
}

.cctvInput {
    padding-left: 13px;
    padding-top: 12px;
    padding-bottom: 12px;

    &.first {
        width: 120px;
        height: 40px;
        margin-right: 8px;
    }

    &.second {
        width: 144px;
        height: 40px;
    }

    &.third {
        width: 344px;
        height: 42px;
        margin-bottom: 26px;
        font: normal normal normal 14px/16px NanumSquare;
        overflow-x: auto;

        &:empty::before {
            content: attr(placeholder);
            font: normal normal normal 14px/16px NanumSquare;
        }

        &:hover:empty {
            position: relative;
            height: 42px;
        }

        &:hover {
            position: relative;
            top: 0;
            overflow: visible;
            -ms-word-break: break-all;
            word-break: break-all;
            word-break: break-word;
            -webkit-hyphens: auto;
            -moz-hyphens: auto;
            hyphens: auto;
            height: 120px;
            max-height: 120px;
            overflow-x: auto;
            z-index: 2;
        }
    }
}

.cctvComponent {
    margin-right: 5px;
    margin-bottom: 5px;
}

.cctvContent {
    margin-right: 3px;
}

.addBtn {
    border-radius: 16px;
    width: 54px;
    height: 32px;
}

.deleteBtn {
    border-radius: 16px;
    width: 54px;
    height: 32px;
    margin-bottom: 13px;
    margin-left: 4.3px;
    margin-bottom: 26px;
}

.makeMain {
    width: 100%;
    height: 100%;
    padding: 30px 40px 0px 40px;
    display: flex;
    flex-direction: column;

    @media screen and (max-height: 1023px) {
        overflow-y: auto;
    }
}

.modalFont22 {
    color: #fff;
    font: normal normal 800 22px/26px NanumSquare;
}

.imgSize {
    width: 142px;
    height: 73px;
}

.customDate {
    width: 100%;

    .vdatetime-input {
        padding-left: 13px;
        padding-top: 12px;
        padding-bottom: 12px;
        max-width: 344px;
        width: 100%;
        height: 40px;
    }

    .vdatetime-popup {
        z-index: 1000;
        //position: fixed; // Original was commented out
        top: 50%;
        left: 50%;
        width: 314px;
        max-width: 314px;
        height: 445px;

        @media all and (max-width: 767px) {
            height: 90%;
            overflow-y: auto;
            max-height: 445px;
        }

        &__header {
            width: 100%;

            @media all and (max-width: 767px) {
                padding: 10px 30px;
            }

            .vdatetime-popup__year {
                font: normal normal bold 20px/16px NanumSquare;

                @media all and (max-width: 767px) {
                    font: normal normal bold 15px/16px NanumSquare;
                }
            }

            .vdatetime-popup__date {
                font: normal normal bold 20px/16px NanumSquare;
                padding-left: 15px;
                transition: opacity 0.3s;
                opacity: 0.7;

                @media all and (max-width: 767px) {
                    font: normal normal bold 15px/16px NanumSquare;
                }

                &:hover {
                    opacity: 1;
                }
            }
        }

        &__body {
            width: 100%;
            height: 100%;

            .vdatetime-calendar {
                width: 100%;
                height: 100%;

                &__navigation {
                    clear: both;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    margin-top: 20px;
                    margin-bottom: 20px;

                    &--previous {
                        // No specific styles here in original
                    }

                    &--next {
                        // No specific styles here in original
                    }

                    .vdatetime-calendar__current--month {
                        font: normal normal bold 17px/16px NanumSquare;
                    }
                }

                &__month {
                    width: 100%;
                    height: 100%;

                    @media all and (max-width: 767px) {
                        height: calc(100% - 100px);
                    }

                    span {
                        padding-bottom: 0px !important;
                        margin-bottom: 0px !important;
                        height: 40px;

                        span {
                            font: normal normal normal 13px/14px NanumSquare;
                            border-radius: 0%;

                            &:hover {
                                border-radius: 0%;
                            }
                        }
                    }

                    .vdatetime-calendar__month__weekday {
                        font: normal normal normal 14px/15px NanumSquare;
                        height: 20px;
                    }
                }

                .vdatetime-calendar__month__day--selected {
                    span {
                        span {
                            border-radius: 0%;
                        }
                    }
                }
            }
        }

        .vdatetime-year-picker__list {
            height: 360px;

            .vdatetime-year-picker__item {
                width: 100%;
                font-family: NanumSquare;

                &--disabled {
                    opacity: 0.1;
                    cursor: default;
                }

                &--selected {
                    // No specific styles here in original
                }
            }

            &::-webkit-scrollbar-thumb {
                // No specific styles here in original
            }
        }

        .vdatetime-month-picker__list {
            height: 360px;

            &::-webkit-scrollbar-thumb {
                // No specific styles here in original
            }

            .vdatetime-month-picker__item {
                width: 100%;
                font-family: NanumSquare;

                &--disabled {
                    opacity: 0.1;
                    cursor: default;
                }

                &--selected {
                    // No specific styles here in original
                }
            }
        }

        &__actions {
            position: absolute;
            right: 0px;
            bottom: 0px;
            padding: 0 0px 10px 10px;

            .vdatetime-popup__actions__button--confirm {
                font: normal normal bold 16px/17px NanumSquare;

                @media all and (max-width: 767px) {
                    width: 0px;
                    height: 0px;
                    padding: 0 0px 0px 0px;
                }
            }

            .vdatetime-popup__actions__button--cancel {
                width: 0px;
                height: 0px;
                padding: 0 0px 0px 0px;
            }
        }
    }
}

.customTime {
    .vdatetime-input {
        padding-left: 13px;
        width: 100%;
        height: 40px;
    }

    .vdatetime-popup {
        z-index: 1000;
        position: fixed;
        top: 50%;
        left: 50%;
        width: 314px;
        max-width: 314px;
        height: 389px;

        @media screen and (max-width: 767px) {
            height: 90%;
            overflow-y: auto;
            // min-height: 305px; // Original was commented out
            max-height: 445px;
        }

        &__header {
            width: 100%;
        }

        &__body {
            .vdatetime-time-picker {
                &__list {
                    .vdatetime-time-picker__item {
                        width: 100%;
                        font-family: NanumSquare;

                        @media screen and (max-width: 767px) {
                            font-size: 20px;
                        }

                        &:hover {
                            @media screen and (max-width: 767px) {
                                font-size: 25px;
                            }
                        }

                        &--selected {
                            @media screen and (max-width: 767px) {
                                font-size: 25px;
                            }
                        }
                    }

                    &::-webkit-scrollbar-thumb {
                        // No specific styles here in original
                    }
                }
            }
        }

        &__actions {
            position: absolute;
            right: 0px;
            bottom: 0px;
            padding: 0 0px 10px 10px;

            .vdatetime-popup__actions__button--confirm {
                font: normal normal bold 16px/17px NanumSquare;
            }

            .vdatetime-popup__actions__button--cancel {
                width: 0px;
                height: 0px;
                padding: 0 0px 0px 0px;
            }
        }
    }
}

.v--modal-overlay .v--modal-box {
    overflow: visible;
}

.optionBox {
    display: flex;
    justify-content: start;
    align-items: center;
    width: 344px;
    font-size: 16px;
    margin-top: 15px;
    color: #fff;

    &__input {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 26px;
        width: 55px;

        input {
            margin-right: 5px;
            width: 16px;
            height: 16px;
        }
    }
}

.showMoreOptionBtn {
    height: 30px;
    border-radius: 20px;
    z-index: 1;
    text-align: center;
    color: #fff;
    margin-top: 16px;
    padding: 0 17px;
    &:hover {
        border-color: #4b4545;
        border: 1px solid #4b4545;
    }
}

.column-gap10 {
    row-gap: 10px;
    display: flex;
    flex-direction: column;
}

.label-box {
    display: flex;
}

.selected-opt {
    position: relative;
    width: 100%;
    min-height: 38px;
    display: flex;
    background: #323232 0 0 no-repeat padding-box;
    padding: 10px;
    overflow-y: auto;
    max-height: 125px;
}

.form-box,
.button-box {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.button-box {
    padding: 21px 0;
}

.dp__main * {
    font-size: 15px;
    background: #323232 0 0 no-repeat padding-box;
}

.input-time-box {
    display: flex;
    gap: 8px;
    > div {
        flex: 1 1 50%;
    }
    * {
        font-size: 14px;
    }
}

.date-container {
    display: flex;
    gap: 8px;
    > div {
        flex: 1;
    }
}
.date-descript {
    color: #a1a1a1;
}
</style>
