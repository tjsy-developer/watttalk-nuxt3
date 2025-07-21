import { defineNuxtPlugin } from 'nuxt/app';
import adapter from 'webrtc-adapter'

export default defineNuxtPlugin(() => {
  // 전역 객체에 adapter 주입
  if (process.client) {
    // @ts-ignore
    window.adapter = adapter;
  }
});
