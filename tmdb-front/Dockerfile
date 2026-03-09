FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=/api
ARG VITE_API_TIMEOUT=10000
ARG VITE_TMDB_API_BASE_URL=https://api.themoviedb.org/3
ARG VITE_TMDB_API_KEY=
ARG VITE_TMDB_BEARER_TOKEN=

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_TIMEOUT=${VITE_API_TIMEOUT}
ENV VITE_TMDB_API_BASE_URL=${VITE_TMDB_API_BASE_URL}
ENV VITE_TMDB_API_KEY=${VITE_TMDB_API_KEY}
ENV VITE_TMDB_BEARER_TOKEN=${VITE_TMDB_BEARER_TOKEN}

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
