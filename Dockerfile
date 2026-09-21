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

# Supabase credentials worden door Vite tijdens de build ingebakken in de
# JS-bundel (import.meta.env.*). Ze moeten dus als build-args binnenkomen,
# niet als runtime environment variabelen (die werken niet meer zodra de
# statische bestanden eenmaal gebouwd zijn).
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

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
