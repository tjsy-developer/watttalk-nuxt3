<template>
	index 페이지입니다 {{ count }}
</template>

<script lang="ts" setup>
import { ref, onMounted, onUpdated, onBeforeUnmount } from 'vue'

const count = ref(0)

// 마운트될 때 실행할 작업
onMounted(() => {
	alert('하이')
})
</script>