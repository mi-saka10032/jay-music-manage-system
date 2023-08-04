FROM node:16.14.2-alpine
WORKDIR /app
ENV TZ="Asia/Shanghai"
ENV MYSQL_HOST=localhost
ENV MYSQL_USERNAME=root
ARG MYSQL_PASSWORD
ENV MYSQL_PORT=3306
ENV REDIS_HOST=localhost
ENV REDIS_PORT=6379
ARG OSS_ACCESSKEY_ID
ARG OSS_ACESSKEY_SECRET
ARG OSS_BUCKET_NAME
ARG OSS_ENDPOINT

COPY . .

RUN npm install --registry=https://registry.npm.taobao.org
RUN npm install pm2 -g
RUN npm run build
RUN npm prune --production

EXPOSE 7001

ENTRYPOINT ["npm", "run", "pmstart"]
