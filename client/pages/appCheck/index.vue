<template>
    <div></div>
</template>

<script lang="js" setup>
const route = useRoute();
const router = useRouter();
const { app } = useRuntimeConfig().public;

onMounted(() => {
    const meetingroomUrl = route.query.meetingroom;

	if (meetingroomUrl) {
		alert(meetingroomUrl.replcae(window.location.origin + app.baseURL));
		return
        router.push(meetingroomUrl.replcae(window.location.origin + app.baseURL));
    }
});
</script>
