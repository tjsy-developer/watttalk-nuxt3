export default {
    legacy: false, // composition API 사용을 위해 설정
    locales: [
        { code: "ko", name: "한글", iso: "ko-KR", file: "ko.json" },
        { code: "en", name: "English", iso: "en-US", file: "en.json" },
    ],
    defaultLocale: "ko",
    langDir: "./", // locales에 설정한 file의 위치 설정, 루트 디렉터리는 i18n으로 설정됨
    strategy: "no_prefix", // url에 ko, en 등 prefix 쓸지 안쓸지 설정
    lazy: true,
    escapeParameterHtml: false,
    detectBrowserLanguage: {
        // cookie 사용해서 locale 정보 저장
        useCookie: true,
        cookieKey: "i18n_redirected",
    },
};
