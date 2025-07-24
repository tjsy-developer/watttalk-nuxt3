<script setup lang="ts">

import { useImageAssets } from '@/composables/useImageAssets';
import { ref } from 'vue';

const isMainMenuOpen = ref(false);
const isSubMenuOpen = ref(false);

const { menuImages } = useImageAssets();
</script>

<template>
    <div class="leftbar">
        <router-link to="/dashboard" class="icon-btn" title="연락처">
            <img :src="menuImages.call" />
            <label class="icon-label">연락처</label>
        </router-link>

        <router-link to="/meeting" class="icon-btn" title="회의실">
            <img :src="menuImages.meetingRoom" />
            <label class="icon-label">회의실</label>
        </router-link>

        <a :href="'http://localhost:8223/attachment/video?page=1&viewType=gallery'" target="_blank" class="icon-btn" title="클라우드">
            <img :src="menuImages.cloud" />
            <label class="icon-label">클라우드</label>
        </a>
        <div class="icon-btn bell" title="알림">
            <img :src="menuImages.notice"></img>
        </div>
        <audio id='calling_bell' loop style="display:none;">
            <source src="@/assets/sounds/Wood.ogg" type='audio/ogg' />
        </audio>
        <audio id='normal_message_bell' style="display:none; ">
            <source src="@/assets/sounds/normal_message.mp3" type='audio/mp3' />
        </audio>
        <audio id='emergency_message_bell' style="display:none; ">
            <source src="@/assets/sounds/emergency_message.mp3" type='audio/mp3' />
        </audio>
        <audio id='direct_message_bell' style="display:none; ">
            <source src="@/assets/sounds/goes-without-saying.ogg" type='audio/ogg' />
        </audio>
        <audio id='fileReceive_message_bell' style="display:none; ">
            <source src="@/assets/sounds/file-receive.wav" type='audio/wav' />
        </audio>
        <audio id='emergency_alarm_bell' style="display:none; ">
            <source src="@/assets/sounds/emergency_alarm.wav" type='audio/wav' />
        </audio>
    </div>
    <canvas id="videoNone" style="display:none;"></canvas>
</template>
