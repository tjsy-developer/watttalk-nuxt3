#!/bin/bash

set -e  # 오류 발생 시 스크립트 종료
set -o pipefail

APPLICATION="smartglass-solution-talk"
APPLICATION_PATH="d:/project/watttalk-nuxt3"  # WSL 환경 또는 리눅스 경로 기준으로 변경
HARBOR_PROJECT_NAME="smartglass"
VERSION=$(date +"%Y%m%d-%H%M%S")

# 소나큐브 관련 변수
export SONAR_SCANNER_ORIGIN="D:\project\sonar-scanner\bin\sonar-scanner"
export SONAR_URL="https://sonarqube.hmg-corp.io"
export SONAR_TOKEN="sqp_7850aae3d821ba8d12787927bb5acd6c9b28f79e"
export SONAR_PROJECT_NAME="smartglass-solution-talk-local"
export SONAR_PROJECT_KEY="smartglass-solution-talk-local"

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
docker build --no-cache -t $APPLICATION:$VERSION .
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

echo "📂 Sonar Scanner 복사 중..."
docker cp "$SONAR_SCANNER_ORIGIN/." "$VERSION:/var/sonar-scanner"
if [ $? -ne 0 ]; then
    echo "❌ Sonar Scanner 복사 실패"
    exit 1
else
    echo "Sonar Scanner 복사 성공"
fi

docker exec $VERSION /var/sonar-scanner \
    -Dsonar.host.url=$SONAR_URL \
    -Dsonar.login=$SONAR_TOKEN \
    -Dsonar.projectKey=$SONAR_PROJECT_KEY \
    -Dsonar.projectName=$SONAR_PROJECT_NAME \
    -Dsonar.sources=$BLACK_DUCK_SOURCE_PATH \
    -Dsonar.exclusions=**/node_modules/** \
    -X

echo "📁 Black Duck 설치 디렉토리 복사 중..."
docker cp "$BLACK_DUCK_INSTALL_ORIGIN/." "$VERSION:$BLACK_DUCK_INSTALL_DIR"
if [ $? -ne 0 ]; then
    echo "❌ docker cp 실패"
    exit 1
else echo "docker cp 성공"
fi

echo "🔑 실행 권한 부여: $JAVA_BIN"
docker exec -u root "$VERSION" bash -c "ls -l \"$JAVA_BIN\" && chmod +x \"$JAVA_BIN\""
if [ $? -ne 0 ]; then
    echo "❌ chmod 실패"
    docker exec -u root "$VERSION" bash -c "ls -l \"$JAVA_BIN\""
    exit 1
else
    echo "chmod 성공"
fi

echo "🔍 Black Duck 스캔 시작..."
docker exec $VERSION bash -c "\
    \"$JAVA_BIN\" -jar \"$BLACK_DUCK_JAR\" \
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
