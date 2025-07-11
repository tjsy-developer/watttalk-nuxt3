<template>
	index 페이지입니다 {{ count }}
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import { definePageMeta } from 'nuxt/dist/pages/runtime'
import { ref, onMounted, onUpdated, onBeforeUnmount } from 'vue'

const count = ref(0)


// 마운트될 때 실행할 작업
onMounted(() => {
	console.log('컴포넌트가 마운트되었습니다.')
})

// 데이터가 업데이트될 때 실행할 작업
onUpdated(() => {
	console.log('컴포넌트가 업데이트되었습니다. 현재 count는:', count.value)
})

// 언마운트되기 전 실행할 작업
onBeforeUnmount(() => {
	console.log('컴포넌트가 언마운트됩니다.')
})
</script>