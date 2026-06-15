#!/bin/sh
echo "==> Starting Next.js server..."
npx next start -p 3001 -H 0.0.0.0 &
NEXT_PID=$!

echo "==> Running prisma db push..."
npx prisma db push --accept-data-loss 2>&1 || echo "DB push failed"

echo "==> Creating admin user..."
node scripts/create-admin.js 2>&1 || echo "Create admin failed"

echo "==> Setup complete"
wait $NEXT_PID
