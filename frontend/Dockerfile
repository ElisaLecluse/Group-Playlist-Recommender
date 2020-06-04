FROM node:alpine AS builder

WORKDIR /app
ENV PATH=/usr/local/bin:$PATH

COPY . .

RUN npm install && \
    npm install bootstrap && \
    npm run build

FROM nginx:alpine

COPY nginx.config /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/* /usr/share/nginx/html/
