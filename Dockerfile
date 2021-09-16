### Dockerfile with multi-stage build ###
# used node-version
ARG NODE_VERSION=14-stretch

## stage 1, compile TypeScript
FROM node:${NODE_VERSION} AS builder

WORKDIR "/usr/src/app"

## needed to avoid error while build
ENV NODE_OPTIONS="--max-old-space-size=1024"

COPY package*.json   ./
COPY tsconfig*.json  ./
COPY .eslintrc.json  ./
COPY .eslintignore   ./
COPY ./src           ./src
RUN npm ci --silent && npm run build

## stage 2, runnnig service
FROM node:${NODE_VERSION}-slim

WORKDIR "/app"

ENV NODE_ENV=production
ENV SERVICE_PORT=8080

COPY package*.json   ./
RUN npm ci --silent --only=${NODE_ENV}

## copy compiled files from stage 1
COPY --from=builder /usr/src/app/dist ./dist

CMD ["node", "/app/dist/server.js"]
EXPOSE ${SERVICE_PORT}
