
import ko from './client/locales/ko-KR.json';
export default {
  // Vue I18n Options (v9+)
  legacy: false, // Composition API 사용을 위해 필수 (권장)
  globalInjection: true, // 템플릿에서 `$t` 등을 전역적으로 사용할 수 있게 함
  locale: 'ko', // 기본 로케일 (실제 사용 시 nuxt-i18n 설정에서 오버라이드될 수 있음)
  fallbackLocale: 'en', // 현재 로케일의 번역이 없을 때 사용할 언어
  messages: {
    ko
  },
};