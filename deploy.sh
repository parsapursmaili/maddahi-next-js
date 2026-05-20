#!/bin/bash

# ۱. هوشمندسازی مسیر: اسکریپت به پوشه‌ای می‌رود که در آن ذخیره شده است
PARENT_PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P)
cd "$PARENT_PATH"

echo "Starting Deployment for BESOOYETO (Port 3001)..."
echo "Work Directory: $PARENT_PATH"

# ۲. بیلد کردن تصویر داکر
# استفاده از نقطه (.) به معنی مسیر فعلی که حالا دقیقاً می‌دانیم کجاست
echo "-> 1. Building new Docker image..."
if docker build --network=host -t besooyeto .; then
    echo "✅ Build successful"
else
    echo "❌ Build failed! Check your Dockerfile."
    exit 1
fi

# ۳. پاکسازی کانتینر قدیمی
echo "-> 2. Stopping and removing old container..."
docker stop besooyeto 2>/dev/null || true
docker rm -f besooyeto 2>/dev/null || true

# ۴. اصلاح دسترسی پوشه‌های مورد نیاز
# ایجاد پوشه storage اگر وجود نداشته باشد
echo "-> 3. Fixing permissions..."
mkdir -p "$PARENT_PATH/storage"
sudo chown -R 1000:1000 "$PARENT_PATH/storage"
sudo chmod -R 755 "$PARENT_PATH/storage"

# ۵. اجرای کانتینر با تنظیمات پایداری
echo "-> 4. Starting new container..."
docker run -d \
  --name besooyeto \
  --restart always \
  -p 3001:3000 \
  --user 1000:1000 \
  --memory 1.5g \
  --cpus 1.5 \
  -v "$PARENT_PATH/storage:/app/storage" \
  -e NODE_ENV="production" \
  besooyeto

# ۶. بررسی وضعیت نهایی
echo "-> 5. Checking logs..."
sleep 5
if [ "$(docker inspect -f '{{.State.Running}}' besooyeto)" == "true" ]; then
    echo "🚀 Container is UP and running!"
    docker logs --tail 20 besooyeto
else
    echo "⚠️ Container failed to start. Check logs below:"
    docker logs besooyeto
fi