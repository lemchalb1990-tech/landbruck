#!/bin/sh
echo "==> Running prisma db push..."
npx prisma db push --accept-data-loss
echo "==> Creating admin user..."
node scripts/create-admin.js
echo "==> Starting Next.js server..."
exec npx next start -p 3001 -H 0.0.0.0
