FROM node:22.14.0-alpine3.20 AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --audit=false --fund=false --ignore-scripts

FROM base AS builder
COPY . .
RUN npm i --omit=opcional --audit=false --fund=false
ENV DOCKER_BUILD=true
RUN npm run build

FROM node:22.14.0-alpine3.20 AS production
WORKDIR /app

COPY --from=builder /app/build/standalone ./
COPY --from=builder /app/build/static ./build/static
COPY --from=builder /app/public ./public

CMD ["node", "server.js"]
EXPOSE 3000
