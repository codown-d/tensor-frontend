FROM nginx:alpine

ARG MIRROR_SOURCE=mirrors.aliyun.com

RUN sed -i "s/dl-cdn.alpinelinux.org/${MIRROR_SOURCE}/g" /etc/apk/repositories \  
    && apk update && apk upgrade \
    && rm -rf /var/cache/apk/*

COPY ./docker/nginx.conf /etc/nginx/
COPY ./docker/default.conf /etc/nginx/conf.d/
COPY ./build /usr/share/nginx/html
COPY ./docker/404.html /usr/share/nginx/html/
