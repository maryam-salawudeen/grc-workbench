# Single container: the API serves the built React app.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY web/package.json web/
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080 DB_PATH=/data/grc.db
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY web/package.json web/
RUN npm ci --omit=dev -w server
COPY shared shared
COPY server/src server/src
COPY --from=build /app/web/dist web/dist
VOLUME /data
EXPOSE 8080
CMD ["node", "server/src/index.ts"]
