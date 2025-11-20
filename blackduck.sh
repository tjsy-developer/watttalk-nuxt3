#!/bin/bash
set -e

APPLICATION="smartglass-solution-talk"
APPLICATION_PATH="/d/project/watttalk-nuxt3"
VERSION=$(date +"%Y%m%d-%H%M%S")

BLACK_DUCK_URL="https://blackduck.hmg-corp.io"
BLACK_DUCK_TOKEN="토큰_여기"
BLACK_DUCK_PROJECT_NAME="${APPLICATION}__LOCAL"
BLACK_DUCK_SOURCE_PATH="/home/node/app"  # 이제 컨테이너 내부 소스 경로
BLACK_DUCK_INSTALL_ORIGIN="/d/project/Black_Duck_Scan_Installation"
BLACK_DUCK_INSTALL_DIR="/var/Black_Duck_Scan_Installation"
BLACK_DUCK_JAR="$BLACK_DUCK_INSTALL_DIR/synopsys-detect-10.2.1.jar"
JAVA_BIN="$BLACK_DUCK_INSTALL_DIR/scan.cli-2024.7.3/jre/bin/java"
BLACK_DUCK_OUTPUT="/tmp/blackduck_output"  # Detect 출력 디렉토리

echo "==============================="
echo "📦 Application: $APPLICATION"
echo "📁 Local Source: $APPLICATION_PATH"
echo "🕒 Version: $VERSION"
echo "==============================="

echo "🛠️ Docker 이미지 빌드 중..."
docker build -t "${APPLICATION}:${VERSION}" "${APPLICATION_PATH}"

echo "🚀 Docker 컨테이너 실행 중..."
CONTAINER_ID=$(docker run -d --name "${VERSION}" "${APPLICATION}:${VERSION}")

echo "📁 Black Duck 설치 파일 복사 중..."
docker cp "${BLACK_DUCK_INSTALL_ORIGIN}/." "${VERSION}:${BLACK_DUCK_INSTALL_DIR}"

echo "🔑 실행 권한 부여..."
docker exec -u root "$VERSION" chmod +x "$JAVA_BIN"

echo "📂 Black Duck 출력 디렉토리 생성 및 권한 설정..."
docker exec -u root "$VERSION" "mkdir -p $BLACK_DUCK_OUTPUT && chown -R $(id -u):$(id -g) $BLACK_DUCK_OUTPUT"

echo "🔍 Black Duck 스캔 시작..."
docker exec "$VERSION" "$JAVA_BIN" -jar "$BLACK_DUCK_JAR" \
    --blackduck.url="$BLACK_DUCK_URL" \
    --blackduck.api.token="$BLACK_DUCK_TOKEN" \
    --blackduck.trust.cert=true \
    --blackduck.offline.mode=false \
    --detect.cleanup=true \
    --detect.project.name="$BLACK_DUCK_PROJECT_NAME" \
    --detect.project.version.name="$VERSION" \
    --detect.source.path="$BLACK_DUCK_SOURCE_PATH" \
    --detect.accuracy.required=NONE

echo "🧹 Black Duck 스캔 완료. 컨테이너 정리 중..."
docker stop "$VERSION"
docker rm "$VERSION"

echo "✅ 작업 완료!"
