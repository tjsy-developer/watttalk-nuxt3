<template>
    <div class="dashboard-container">
        <main class="main-content">
            <!-- 중앙 대시보드 콘텐츠 -->
        </main>

        <section class="right-panel">
            <OrganizationTreeTest></OrganizationTreeTest>
        </section>
    </div>
</template>

<script lang="ts" setup>
// import ContactList from '@/components/pages/dashboard/ContactList.vue'
import OrganizationTreeTest from "@/components/pages/dashboard/OrganizationTreeTest.vue";
import RecentCallList from "@/components/pages/dashboard/RecentCallList.vue";
import { ref, onMounted, onUpdated, onBeforeUnmount } from "vue";

const count = ref(0);

// 마운트될 때 실행할 작업
onMounted(() => {
    console.log("컴포넌트가 마운트되었습니다.");
});

// 데이터가 업데이트될 때 실행할 작업
onUpdated(() => {
    console.log("컴포넌트가 업데이트되었습니다. 현재 count는:", count.value);
});

// 언마운트되기 전 실행할 작업
onBeforeUnmount(() => {
    console.log("컴포넌트가 언마운트됩니다.");
});
</script>

<style lang="scss">
.dashboard-container {
    /* position: absolute;
    left: 64px;
    top: 64px;
    display: flex;
    height: 100vh;
    @include tc(background-color, 'bg-color') */
	display: flex;
	height: inherit;
}
.main-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.right-panel {
	width: 100%;
    max-width: 616px;
    height: 100%;
    max-height: 753px;
    padding: 41px 38px 8px 42px;
    z-index: 1;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    overflow-y: auto;
    position: absolute;
    right: 230px;
    bottom: 0;
	box-sizing: border-box;
	@include tc(background-color, 'component-bg-color')
}
</style>
