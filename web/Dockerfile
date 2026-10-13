FROM node:24-alpine AS builder
WORKDIR /app/web

COPY web/package*.json ./
RUN npm ci

COPY web/ .
COPY api/openapi.yaml /app/api/openapi.yaml
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html

COPY web/nginx.conf /etc/nginx/conf.d/default.conf

RUN rm -rf ./*
COPY --from=builder /app/web/dist .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
