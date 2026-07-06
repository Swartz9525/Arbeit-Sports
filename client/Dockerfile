# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production Stage - Nginx serving static files
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
# COPY custom nginx conf if needed
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
