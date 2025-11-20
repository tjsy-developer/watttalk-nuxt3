#!/bin/bash

set -e  # 오류 발생 시 스크립트 종료
set -o pipefail

APPLICATION="smartglass-solution-talk"
APPLICATION_PATH="d:/project/watttalk-nuxt3"  # WSL 환경 또는 리눅스 경로 기준으로 변경
HARBOR_PROJECT_NAME="smartglass"
VERSION=$(date +"%Y%m%d-%H%M%S")

# Black Duck 설정
BLACK_DUCK_URL=https://blackduck.hmg-corp.io
BLACK_DUCK_TOKEN=YmIzNWJlMzktMzE5ZC00ODBhLTg5MDEtM2E3MGU1OTEwMTFlOmUyYTg3N2Q2LTcwOTItNGFiMC05MDQ1LWRiMjU0MmIxNzQ1MA==
BLACK_DUCK_PROJECT_NAME="$APPLICATION"__LOCAL
BLACK_DUCK_SOURCE_PATH=/home/node/app
BLACK_DUCK_INSTALL_ORIGIN=D:/project/Black_Duck_Scan_Installation
BLACK_DUCK_INSTALL_DIR=/var/Black_Duck_Scan_Installation

# 스캔 신버전
BLACK_DUCK_JAR=$BLACK_DUCK_INSTALL_DIR/synopsys-detect-10.2.1.jar
JAVA_BIN=$BLACK_DUCK_INSTALL_DIR/scan.cli-2024.7.3/jre/bin/java

# 스캔 구버전
# BLACK_DUCK_JAR=$BLACK_DUCK_INSTALL_DIR/synopsys-detect-9.1.0.jar
# JAVA_BIN=$BLACK_DUCK_INSTALL_DIR/scan.cli-2023.10.2/jre/bin/java

echo "==============================="
echo "📦 Application: $APPLICATION"
echo "📁 Folder: $BLACK_DUCK_PROJECT_NAME"
echo "🕒 Version: $VERSION"
echo "==============================="

echo "📁 디렉토리 이동: $APPLICATION_PATH"
cd "$APPLICATION_PATH" || { echo "❌ 디렉토리 이동 실패"; exit 1; }

echo "🛠️ Docker 이미지 빌드 중..."
docker build -t $APPLICATION:$VERSION .
if [ $? -ne 0 ]; then
    echo "❌ Docker 빌드 실패"
    exit 1
fi

echo "🚀 Docker 컨테이너 실행 중..."
docker run -d --name $VERSION $APPLICATION:$VERSION
if [ $? -ne 0 ]; then
    echo "❌ Docker 컨테이너 실행 실패"
    exit 1
fi

echo "📁 Black Duck 설치 디렉토리 복사 중..."
docker cp "$BLACK_DUCK_INSTALL_ORIGIN/." "$VERSION:$BLACK_DUCK_INSTALL_DIR"
if [ $? -ne 0 ]; then
    echo "❌ docker cp 실패"
    exit 1
else echo "docker cp 성공"
fi

echo "🔑 실행 권한 확인 및 부여: $JAVA_BIN"
docker exec -u root "$VERSION" sh -c "if [ ! -x \"$JAVA_BIN\" ]; then chmod +x \"$JAVA_BIN\"; fi"

echo "🔍 Black Duck 스캔 시작..."
docker exec $VERSION sh -c "\
'$JAVA_BIN' -jar '$BLACK_DUCK_JAR' \
--blackduck.url='$BLACK_DUCK_URL' \
--blackduck.api.token='$BLACK_DUCK_TOKEN' \
--blackduck.trust.cert=true \
--blackduck.offline.mode=false \
--detect.cleanup=true \
--detect.project.name='$BLACK_DUCK_PROJECT_NAME' \
--detect.project.version.name='$VERSION' \
--detect.source.path='$BLACK_DUCK_SOURCE_PATH' \
--detect.accuracy.required=NONE"


if [ $? -ne 0 ]; then
    echo "❌ Black Duck 실행 실패"
    exit 1
fi

echo "📂 exec 디렉토리로 이동"
