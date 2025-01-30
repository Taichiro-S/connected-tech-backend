FROM ubuntu:22.04 as development

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    curl \
    unzip

# Bunのインストール
RUN curl -fsSL https://bun.sh/install | bash

# PATHにbunを追加
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app
COPY package*.json bun.lockb ./
RUN bun install
COPY . .

CMD ["bun", "run", "dev"]