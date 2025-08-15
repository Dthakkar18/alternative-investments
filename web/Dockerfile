# web/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install deps (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build for production (safe even if you dev with override)
RUN npm run build

EXPOSE 3000

# Default = prod server; dev will override this in docker-compose.override.yml
CMD ["npm", "run", "start"]


