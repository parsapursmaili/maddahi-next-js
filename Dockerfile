# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json next.config.mjs ./
# RUN npm install
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV production

# استفاده از یوزر آماده node با آیدی 1000
RUN mkdir -p .next/static public storage && chown -R node:node /app

# کپی کردن فقط خروجی‌های ضروری (بسیار سبک و سریع)
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/storage ./storage
COPY --chown=node:node .env* ./ 

USER node
EXPOSE 3000
ENV PORT 3000
# اجرای مستقیم با خودِ Node (بسیار پایدارتر از npm start)
CMD ["node", "server.js"]