# Stage 1: Build frontend
FROM node:24-bookworm-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:24-bookworm-slim AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Stage 3: Production runner
FROM node:24-bookworm-slim AS runner
WORKDIR /app

# Install build tools for better-sqlite3 native compilation if needed
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy backend package files and install production dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --omit=dev

# Copy compiled artifacts
COPY --from=backend-builder /app/backend/dist /app/backend/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_PATH=/data/salary.db
ENV FRONTEND_DIST=../frontend/dist

EXPOSE 3001

CMD ["node", "dist/index.js"]
