# Stage 1: Build de applicatie
FROM node:20-alpine AS builder

# Stel working directory in
WORKDIR /app

# Kopieer package files
COPY package*.json ./

# Installeer dependencies
RUN npm ci

# Kopieer de rest van de code
COPY . .

# Build de applicatie
RUN npm run build

# Stage 2: Productie image met Nginx
FROM nginx:alpine

# Kopieer custom nginx configuratie
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopieer gebouwde applicatie van builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose poort 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
