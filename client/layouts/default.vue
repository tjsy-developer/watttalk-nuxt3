
<script setup>
import dHeader from '@/components/layout/header.vue';
import sidebar from '@/components/layout/sidebar.vue';
</script>

<template>
	<dHeader></dHeader>
	<div class="content"><slot></slot></div>
	<sidebar></sidebar>
</template>

<style lang="scss">
.content {
	position: absolute;
    left: 64px;
    top: 50px;
	width: 100%;
	height: 100vh;
	@include tc(background-color, 'bg-color')
}
</style>