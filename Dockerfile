# ==========================================
# Stage 1: Build Frontend (React + Vite)
# ==========================================
FROM node:22-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ==========================================
# Stage 2: Production Runtime (Node.js + Express)
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install dumb-init for proper Unix signal forwarding
RUN apk add --no-cache dumb-init

# Create a non-root application user for container security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install production server dependencies only
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --omit=dev

WORKDIR /app

# Copy server source code
COPY server/ ./server/

# Copy built frontend assets from stage 1 into client/dist
COPY --from=client-builder /app/client/dist ./client/dist

# Set permissions for non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server/server.js"]
