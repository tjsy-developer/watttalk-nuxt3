// plugins/pdfjs.client.ts

import * as pdfjsLib from "pdfjs-dist/build/pdf";
// import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url"; // 이 줄은 이제 필요 없습니다.

export default defineNuxtPlugin(() => {
  // public 폴더에 복사된 pdf.worker.min.js 파일의 경로를 직접 지정합니다.
  // Nuxt의 public 폴더는 웹 서버의 루트 경로로 직접 접근 가능합니다.
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.mjs'; // public/pdf.worker.min.js 라면 이렇게
  // 만약 public/workers/pdf.worker.min.js 에 복사했다면:
  // pdfjsLib.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.js';


  // 이 플러그인을 통해 pdfjsLib를 Nuxt 앱 전역에서 사용할 수 있도록 provide
  return {
    provide: {
      pdfjsLib: pdfjsLib,
      // 필요하다면 parsePDF 함수도 여기서 제공
      parsePDF: (arrayBuffer) => {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        return loadingTask.promise;
      }
    }
  }
});