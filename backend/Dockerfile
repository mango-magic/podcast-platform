# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install FFmpeg and dependencies for video processing
RUN apk add --no-cache \
    ffmpeg \
    ffmpeg-dev \
    curl \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Verify FFmpeg installation
RUN ffmpeg -version && ffprobe -version

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]

