# Étape 1 : Build
FROM node:20-alpine AS builder

RUN addgroup -S cyna && adduser -S cyna -G cyna
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force