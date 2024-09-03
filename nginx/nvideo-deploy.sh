#!/bin/bash
# webhook에 의해 실행됨. 직접 실행되는 위치에 놔야함.
set -e;

SOURCE_DIR=/var/webhook/tmp/nvideo/;

rm -rf $SOURCE_DIR;
gh repo clone neizzz/nvideo $SOURCE_DIR;
cd $SOURCE_DIR;
git checkout master;

VIDEO_DIR=$HOME/docker/volume/nvideo/videos/;
NGINX_CONF_PATH=$SOURCE_DIR/nginx/nginx.conf;
CONTAINER_NAME=nvideo-server;
IMAGE_NAME=nytimes/nginx-vod-module;
EXTERNAL_PORT=9999;
INTERNAL_PORT=80;

mkdir -p $VIDEO_DIR;
mkdir -p $HOME/nginx/;
cp $NGINX_CONF_PATH $HOME/nginx/nginx.conf;

# 컨테이너가 실행 중인지 확인
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "컨테이너 '$CONTAINER_NAME'가 이미 실행 중입니다."
else
    # 컨테이너가 존재하는지 확인
    if [ "$(docker ps -a -q -f name=$CONTAINER_NAME)" ]; then
        echo "컨테이너 '$CONTAINER_NAME'가 존재하지만 실행 중이 아닙니다. 컨테이너를 시작합니다."
        docker start $CONTAINER_NAME

        # 컨테이너가 정상적으로 시작되었는지 확인
        if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
            echo "컨테이너 '$CONTAINER_NAME'가 성공적으로 시작되었습니다."
        else
            echo "컨테이너 '$CONTAINER_NAME'를 시작하는 데 실패했습니다."
        fi
    else
        echo "컨테이너 '$CONTAINER_NAME'가 존재하지 않습니다. 새로 생성 후 실행합니다."
        docker run -d -p $EXTERNAL_PORT:$INTERNAL_PORT -v $VIDEO_DIR:/opt/static/videos -v $NGINX_CONF_PATH:/usr/local/nginx/conf/nginx.conf --name $CONTAINER_NAME $IMAGE_NAME

        # 컨테이너가 정상적으로 생성 및 시작되었는지 확인
        if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
            echo "컨테이너 '$CONTAINER_NAME'가 성공적으로 생성되고 실행되었습니다."
        else
            echo "컨테이너 '$CONTAINER_NAME' 생성 또는 실행에 실패했습니다."
        fi
    fi
fi

