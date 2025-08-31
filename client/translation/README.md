# google spread sheet 작성

- 1열은 header
  - header 순서는 키, 한글, 영어, 에스파냐어 순으로 꼭 지킬것. -추후 언어가 추가되면
  - i18next-scanner.config.js > lngs 마지막에 추가.
  - ./index.js > columnKeyToHeader 마지막에 추가.
  - ./download.js > languageIndex 조건 추가.
  - header 마지막에 신규 언어 추가.
  - ./upload.js 파일에 updateTranslationsFromKeyMapToSheet 함수 안 GOOGLETRANSLATE 추가 필요
  - antd locale 작업위해 App.tsx에 다국어처리용 useEffect 수정 필요
  - antd locale 작업위해 redux/setLang.ts 수정 필요

# upload 방법

## 주의사항
<div style="color: red;">
npm run upload 할때 시트 웹페이지는 닫고 진행바랍니다. 많은 수정이 있을시 페이지와 명령어가 먹통되는 현상이 있습니다.
</div>

1. npm run upload:i18n 실행

- 지정된 폴더의 하위 파일들 전부 확인 후 options > func > list의 변수 들 전체 scan진행 후 spreadsheet에 올라감.

** 아래 2~3번은 안해도된다. updateTranslationsFromKeyMapToSheet 함수에서 처리 다만 4번은 확인바람
2. google spread sheet 하단에 새로 추가된 문자들이 올라가져있다 A, B 는 한글로 예상된다.

- 새로 추가된 문자의 시작 행의 각 칸에 GOOGLETRANSLATE 함수를 사용한다. (google spread sheet에서 사용가능한 번역 함수이다.)
    - ex) =GOOGLETRANSLATE(B1, "ko", "ja") <- 첫번째 인자는 번역할 문자(열+행), 2번째는 번역할 언어, 3번째는 번역될 언어이다.
    - 한글을 바로 영어로 번역하는 경우 잘못 번역되는 경우가 많아, 한국어 -> 일본어 -> 영어 -> 에스파냐어 순으로 번역해주는게 그나마 오류가 적다.

3. 행의 모든 칸에 함수를 걸었다면 data가 있는 마지막 행까지 함수를 전부 걸어준다.

- data가 없는 행에도 함수를 걸 경우 "#VALUE!"라는 오류가 출력되고, 이를 download 할 경우 각 json 파일에 "" : "" 이라는 값들이 추가된다.

4. 일본어에서 영어로 갔다하더라도 오번역되는 경우가 많다. 일일이 확인이 필요하다...

### upload.js에서 지원하는 기능

1. 시트에 이미 추가되있는 상태에서 중복된 키를 가진 값은 시트에 추가 안됨
2. 파싱할때 사용안하는 키는 파싱 안함(removeUnusedKeys 옵션)
3. 시트에서 사용안하는 행 삭제(handleChangeRows 함수)
4. 시트 따로 건들 필요없이 npm upload 할때 번역값으로 쓸수있게 값 설정(updateTranslationsFromKeyMapToSheet 함수)

# download 방법

1. npm run serve를 치면 다운로드가 실행된다.
   다운로드가 끝나면 cmd 창에 'spread sheet download finish'
   라고 찍힌다.
    - 위에 업로드에서 자동번역되는데 시간이 걸릴수도있으니 시트 확인 후에 번역 완료됐다면 다운로드 받아야한다. 번역중에 다운로드하면 loading이 그대로 찍히는 문제가 있다.

- 다운로드 후에는 google spread sheet 내용을 최대한 건들지 말아주세요.
    - 배포 시에도 npm run serve 한번 부탁드립니다.

# [i18next-scanner.config.js](../../i18next-scanner.config.js)

- 신규 폴더 생성 시
    - module.exports > input에 해당 폴더 경로 추가

# trnaslation 폴더 내 파일 설명 및 수정된 부분 설명

1. [credentials](./.credentials/)
   폴더의 하위 파일은 google api 서비스(https://console.cloud.google.com/apis/api/sheets.googleapis.com/)를 통해 만든 api 키이다. google 계정이 변겅되면 해당 파일도 변경해야된다.

2. [index.js](./index.js)

    - creds 는 credentials 폴더의 하위 파일을 참조하는 것이다
    - spreadsheetDocId는 google spread sheet url을 보면 나온다.
    - sheetId 또한 google spread sheet url에 나와있다.
      ex) https://docs.google.com/spreadsheets/d/1DNmH4avlFlxcSEIgXce1T513f62yHoP3I3DT32a6Vsw/edit#gid=0
        - d 뒤에 바로 붙는게 spreadsheetDocId, gid는 sheetId이다.

3. [download.js](./download.js)
    - 보통 인터넷에 올라온 방식과 다운로드를 하는 방식이 다르다.
    - api가 변경되었는지, 올라와있는 방식을 사용하면 download가 정상적으로 진행되지 않는다. 이유는 보통 row[columnKeyToHeader.key]을 key로 사용하는데, columnKeyToHeader.key에 해당 내역이 전혀 없다.
    - 이에 26번 째 줄의 languageIndex를 새로이 추가하고, 우리의 환경에 맞춰주었다.
        - languageIndex에 값 할당 조건은 한글(B열)을 1 그 이후 순차적으로 1개씩 늘어나는 형식이다.


## 프로젝트용으로 새로운 시트를 만들 때 적용 방법 정리
1. 구글 로그인 후 https://console.cloud.google.com/ 접속
2. 새 프로젝트 만들기
3. 위에서 만든 프로젝트 > 라이브러리 > sheets 검색 후 사용 클릭
4. 프로젝트 > 사용 설정된 API 및 서비스 > sheets 클릭 > 사용자 인증 정보 > 서비스 계정관리 클릭
5. 서비스 계정 만들기
6. 만들어진 서비스 계정이 목록에 나타나면 작업 ... 눌러서 키 관리 클릭
7. 키 추가 > 새 키 만들기 > json으로 만들기 해서 다운받아진 파일을 ./.credentials/ 폴더 밑으로 추가
8. 번역용 시트 만들어서 위 index.js 참고해서 docId, sheetId 값, creds 경로 변경
* 기존 locale json 파일 토대로 없는 값들만 시트에 추가됨으로 기존 사용하던 시트를 복사해서 만들거나 새로 만들 시에는 locales/*/*.json 파일들값을 {} empty json으로 변경 후 npm run 해주면 된다.
* npm run 돌렸을때 403이 뜬다면 시트 공유 목록에 위 서비스 계정이 있는지 확인. 없을시 편집자 권한으로 추가 필요
* 시트를 새로 만들었을때 기본 행수가 1000개인데 번역해야할게 1000개를 넘으면 오류가 생긴다. 행을 넉넉하게 추가해주고 다시 실행하면 정상작동한다.