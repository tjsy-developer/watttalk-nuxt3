<template>
    <main class="main">
        <img class="bg_img" src="@/assets/images/logo_bg.png" alt="background logo" />
    </main>
</template>

<script setup>
import { useSignallingSocket } from "@/composables/socket/useSignallingSocket";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const { signallingSocket } = useSignallingSocket();

const uniqueRoomid = ref("");
const attSeq = ref("");

/**
 * URL 파라미터 확인
 */
const getUrlParameter = async () => {
	const route = useRoute();
    uniqueRoomid.value = route.query.unique_roomid || "";
    attSeq.value = route.query.att_seq || "";

    if (!uniqueRoomid.value || !attSeq.value) {
        console.error("bad Request");
        return false;
    }

    console.log("*** getURLParameter: uniqueRoomid =", uniqueRoomid.value);
    console.log("*** getURLParameter: attSeq =", attSeq.value);
    return true;
};

/**
 * 영상 녹화 요청
 */
const requestVideoRecording = () => {
    console.log("*** methods: requestVideoRecording");

    const obj = {
        unique_roomid: uniqueRoomid.value,
        att_seq: attSeq.value,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("mp4encoderRequestAgain", json);
    console.log("*** socket: emit mp4encoderRequestAgain > json:", json);

    signallingSocket.disconnect();
    alert("영상통화 녹화 요청에 성공하였습니다.");
    window.close();
};

onMounted(async () => {
    console.log("*** requestVideoRecording ***");

    const result = await getUrlParameter();
	if (!result) return;

	requestVideoRecording();

    signallingSocket.on("mp4encoderRequestAgain", (response) => {
        if (!response) return;

        const json = JSON.parse(response);
        console.log("*** socket.on: mp4encoderRequestAgain response", json);

        if (json.status === 0) {
            alert("이미 영상 녹화를 요청한 상태입니다.");
        } else if (json.status === 1) {
            alert("영상 녹화를 재 요청하였습니다.");
        } else if (json.status === 2) {
            alert("영상 녹화 요청을 실패하였습니다.\n관리자에게 문의하시기 바랍니다.");
        }

        signallingSocket.disconnect();
        window.close();
    });
});
</script>

<style lang="scss">
.main {
    width: 100vw;
    height: 100vh;
    background-color: #4a4a4a;
    display: flex;
    justify-content: center;
    align-items: center;

    .bg_img {
        width: 50%;
        height: 50%;
        object-fit: contain;
    }
}
</style>
