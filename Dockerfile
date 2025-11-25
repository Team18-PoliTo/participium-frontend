# Frontend Dockerfile - Multi-stage build
# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (ignore scripts for security)
RUN npm ci --ignore-scripts

# Copy source code
# Note: .dockerignore ensures sensitive files (.env, node_modules, etc.) are excluded
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.js ./

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Note: nginx runs as non-root user 'nginx' by default in alpine image
# The nginx process itself runs as 'nginx' user, only the master process runs as root
# This is the standard and secure configuration for nginx containers

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

