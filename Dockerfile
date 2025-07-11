FROM node:22.15.1

# Dockerfile 작성자
LABEL maintainer="devops@wattsolution.co.kr"

# 애플리케이션 디렉토리 설정
ARG APP_DIR=/home/node/app

# 작업 디렉토리 설정
WORKDIR $APP_DIR

COPY ./ ./

# 파일 소유권을 비루트 사용자에게 넘김
RUN chown -R node:node /home/node/app

# 비루트 사용자로 전환
USER node


# 환경 변수 파일 복사
# COPY configs/hdcardev $APP_DIR/.env
# COPY nuxt_configs/hdcardev $APP_DIR/nuxt.config.js

# 의존성 설치 & # 애플리케이션 빌드
RUN npm install
RUN npm run build

CMD ["npm", "start"]