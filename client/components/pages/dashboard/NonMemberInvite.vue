<template>
    <div class="email-input">
        <!-- 아이디 입력 -->
        <input v-model="id" type="text" placeholder="아이디 입력" class="input-id"/>

        <span class="at-symbol">@</span>

        <!-- 초기: select, 직접입력 선택 시 input -->
        <input
			v-if="!selectedDomain"
            v-model="customDomain"
            type="text"
            placeholder="도메인 직접입력"
            class="input-domain"
        />
        <select v-model="selectedDomain" class="select-domain">
            <option v-for="(opt, key) in mailOpts" :key="key" :value="opt.value">
                {{ opt.label }}
            </option>
        </select>
		<div>
			<button class="send-btn" @click="handleClickNonMemberInvite">{{ t('메일 전송')}}</button>
		</div>
    </div>
</template>

<script setup>
import { useCallStore } from "@/stores/call";
import { useMeetingStore } from "@/stores/meeting";
import { ref, computed, watch } from "vue";

const mailOpts = [
    { label: "직접입력", value: "" },
    { label: "naver.com", value: "naver.com" },
    { label: "nate.com", value: "nate.com" },
    { label: "hanmail.net", value: "hanmail.net" },
    { label: "gmail.com", value: "gmail.com" },
    { label: "wattsolution.co.kr", value: "wattsolution.co.kr" },
];

const { t } = useI18n();
const id = ref("");
const selectedDomain = ref(mailOpts[1].value); // 초기 select 선택 (naver.com 등)
const customDomain = ref("");

const meetingStore = useMeetingStore();
const callStore = useCallStore();

// watch로 "직접입력" 선택 시 input 활성화
watch(selectedDomain, (val) => {
    if (val === "") {
        customDomain.value = "";
    }
});

const email = computed(() => {
    return selectedDomain.value === ""
        ? `${id.value}@${customDomain.value}`
        : `${id.value}@${selectedDomain.value}`;
});

const handleClickNonMemberInvite = () => {
    // 메일 아이디 + "@" + 도메인주소
    const regExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    // 이메일 유효성 검사
    if (!regExp.test(email.value)) {
        alert(t("enter the correct email format"))
        return
    }

    callStore.setInCallingFunctionParams(email.value)
    callStore.setInCallingFunction("inviteNonMember")
}
</script>

<style lang="scss" scoped>
.email-input {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 15px;

    input,
    select {
        color: #fff;
        padding: 1rem 0.75rem;
        border: 1px solid #4c4c4c;
        border-radius: 4px;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s ease;
        background-color: #000;
        font-size: 13px;
        &:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
    }

    .at-symbol {
        font-size: 1rem;
        color: #fff;
        user-select: none;
    }

    .input-id {
        flex: 1;
    }

    .input-domain,
    .select-domain {
        flex: 1;
    }
}
</style>
