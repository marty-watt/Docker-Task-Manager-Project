##	Uses Node.js runtime environment
##	Installs dependencies with npm
##	Copies source code into container
##	Exposes port 3001 for API traffic


# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Production stage  
FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001
WORKDIR /app
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --chown=nodeuser:nodejs . .
USER nodeuser
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js
CMD ["node", "server.js"]