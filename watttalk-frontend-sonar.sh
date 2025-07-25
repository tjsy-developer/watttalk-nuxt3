#!/bin/bash

# 환경 변수 설정
export APPLICATION_FOLDER_NAME="watttalk"

VERSION=$(date +"%Y%m%d-%H%M%S")


# export SONAR_URL="http://localhost:9000"
# export SONAR_TOKEN="sqp_e554a7890e682b5662617f4b8e7ca4696cc774b8"

# 소나큐브 관련 변수
export SONAR_SCANNER_ORIGIN="D:\project\sonar-scanner\bin\sonar-scanner"
export SONAR_URL="https://sonarqube.hmg-corp.io"
export SONAR_TOKEN="sqp_4bf71412ebacf9d4c012a489a65aead9947876c3"
export SONAR_PROJECT_NAME="smartglass-solution-talk-local"
export SONAR_PROJECT_KEY="smartglass-solution-talk-local"

# 현재 디렉토리 변경
cd "D:\project\watttalk-nuxt3" || exit

# 소나큐브 스캔 실행
"$SONAR_SCANNER_ORIGIN" \
  -Dsonar.host.url="$SONAR_URL" \
  -Dsonar.login="$SONAR_TOKEN" \
  -Dsonar.projectKey="$SONAR_PROJECT_KEY" \
  -Dsonar.projectName="$SONAR_PROJECT_NAME" \
  # -Dsonar.exclusions="**/node_modules/**" \
  -Dsonar.sources="." \
  -X

# 종료 시 실행파일 위치로 이동
cd ../exec || exit
