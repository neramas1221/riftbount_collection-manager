# Stage 1: build the Angular app (multi-arch base image — works on the Pi's arm64 too)
FROM node:22-alpine AS build
WORKDIR /app

# Copy just the manifest first so `npm ci` is cached across builds when only source changes
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: serve the built static files with nginx, proxying /api to the Spring Boot container
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/webapp/browser /usr/share/nginx/html

EXPOSE 80
