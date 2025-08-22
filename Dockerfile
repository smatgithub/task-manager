# ---- 1) Build SPA ----
    FROM node:20-alpine AS ui
    WORKDIR /ui
    COPY ClientConnect/package*.json ./
    RUN npm ci
    COPY ClientConnect ./
    RUN npm run build
    # ---- 2) Run API + serve SPA ----
    FROM node:20-alpine
    WORKDIR /app
    COPY ServerConnect/package*.json ./
    RUN npm ci --omit=dev
    COPY ServerConnect ./
    # Copy built SPA into /app/client
    COPY --from=ui /ui/dist ./client
    ENV NODE_ENV=production
    ENV PORT=8080
    EXPOSE 8080
    HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
      CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
    CMD ["node","server.js"]