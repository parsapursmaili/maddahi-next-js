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
ENV NODE_ENV=production

# ۱. ساخت پوشه کش و ساختار اولیه با دسترسی کاربر node
RUN mkdir -p .next/cache && chown -R node:node /app

# ۲. کپی کردن هسته سرور نکست‌جی
COPY --from=builder --chown=node:node /app/.next/standalone ./

# ۳. کپی کردن ظاهر سایت و عکس‌ها (که در standalone نبودند)
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --chown=node:node .env* ./ 

USER node
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]