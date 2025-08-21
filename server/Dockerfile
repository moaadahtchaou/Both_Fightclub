# Multi-arch lightweight Node image
FROM node:20-bookworm-slim

# Install ffmpeg and python3 for yt-dlp post-processing
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg python3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# App directory
WORKDIR /app

# Install dependencies first (leverage Docker layer cache)
COPY package*.json ./
# Use npm ci when lockfile exists; fall back to npm install
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy source
COPY . .

ENV NODE_ENV=production
# Render injects PORT env; our dev.js uses PORT or 3000
EXPOSE 3000

# Start the API server
CMD ["node", "dev.js"]