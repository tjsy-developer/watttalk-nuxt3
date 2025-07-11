<script setup lang="ts">

import { useImageAssets } from '@/composables/useImageAssets';
import { ref } from 'vue';

const isMainMenuOpen = ref(false);
const isSubMenuOpen = ref(false);

const { menuImages } = useImageAssets();
</script>

<template>
    <div class="leftbar">
        <div class="icon-btn" title="연락처">
            <img :src="menuImages.call"></img>
            <label class="icon-label">연락처</label>
        </div>
        <div class="icon-btn" title="회의실">
            <img :src="menuImages.meetingRoom"></img>
            <label class="icon-label" >회의실</label>
        </div>
        <div class="icon-btn" title="클라우드">
            <img :src="menuImages.cloud"></img>
            <label class="icon-label">클라우드</label>
        </div>
        <div class="icon-btn bell" title="알림">
            <img :src="menuImages.notice"></img>
        </div>
    </div>
</template>
