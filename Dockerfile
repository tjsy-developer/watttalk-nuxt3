# FROM node:22.15.1

# # Dockerfile 작성자
# LABEL maintainer="devops@wattsolution.co.kr"

# # 애플리케이션 디렉토리 설정
# ARG APP_DIR=/home/node/app

# # 작업 디렉토리 설정
# WORKDIR $APP_DIR

# # 실제 소스 복사
# COPY package*.json ./
# COPY tsconfig.json ./
# COPY nuxt.config.ts ./
# COPY app.vue ./
# COPY client ./client
# COPY configs ./configs
# COPY config ./config
# COPY i18n ./i18n
# COPY nuxt_configs ./nuxt_configs
# COPY .env .env


# # 파일 소유권을 비루트 사용자에게 넘김
# RUN chown -R node:node /home/node/app

# # 비루트 사용자로 전환
# USER node


# # 환경 변수 파일 복사
# # COPY configs/hdcardev $APP_DIR/.env
# # COPY nuxt_configs/hdcardev $APP_DIR/nuxt.config.js

# # 의존성 설치 & # 애플리케이션 빌드
# RUN npm install
# RUN npm run build

# CMD ["npm", "start"]


# 빌드 단계
# --- 빌드 단계 ---
# FROM node:22.15.1 AS builder

# WORKDIR /home/node/app

# COPY package*.json ./
# COPY tsconfig.json ./
# COPY nuxt.config.ts ./
# COPY app.vue ./
# COPY client ./client
# COPY configs ./configs
# COPY config ./config
# COPY i18n ./i18n
# COPY nuxt_configs ./nuxt_configs
# COPY .env .env

# RUN npm ci
# RUN npm run generate   # 결과물은 .output/public

# # --- 배포 단계 ---
# FROM nginx:alpine

# # 빌드 산출물 복사
# COPY --from=builder /home/node/app/.output/public /usr/share/nginx/html

# # Nginx 설정 (SPA 라우팅 포함)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 3001

# CMD ["nginx", "-g", "daemon off;"]


# --- 빌드 단계 소나큐브 처리용 ---
FROM node:22.15.1 AS builder

WORKDIR /home/node/app

COPY package*.json ./
COPY tsconfig.json ./
COPY nuxt.config.ts ./
COPY app.vue ./
COPY client ./client
COPY configs ./configs
COPY config ./config
COPY i18n ./i18n
COPY nuxt_configs ./nuxt_configs
COPY .env .env

RUN npm ci
RUN npm run generate   # 결과물은 .output/public

# --- 배포 단계 ---
FROM nginx:alpine

# 필요한 디렉토리 생성 및 소유권 변경
RUN mkdir -p /usr/share/nginx/html /run /var/cache/nginx /var/log/nginx \
    && chown -R nginx:nginx /usr/share/nginx/html /run /var/cache/nginx /var/log/nginx

# 빌드 산출물 복사 (권한 nginx로)
COPY --chown=nginx:nginx --from=builder /home/node/app/.output/public /usr/share/nginx/html

# Nginx 설정
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 비-루트 유저로 실행 (이미 존재하는 nginx 유저 사용)
USER nginx

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]