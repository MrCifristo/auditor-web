# Etapa de build
FROM node:22-alpine AS builder

WORKDIR /app

ENV NODE_ENV=development

COPY frontend/package.json frontend/package-lock.json* ./ 
RUN npm install

COPY frontend/ ./ 

RUN npm run build

# Etapa de runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Usuario no root
RUN addgroup -g 1001 appgroup \
    && adduser -S -u 1001 appuser -G appgroup

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

USER appuser

EXPOSE 3000

CMD ["npm", "run", "start"]
