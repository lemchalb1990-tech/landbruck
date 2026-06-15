#!/bin/sh
set -e

trap 'kill $NEXT_PID 2>/dev/null; exit 0' TERM INT

echo "==> Running prisma db push..."
npx prisma db push --accept-data-loss 2>&1 || echo "DB push warning (non-fatal)"

echo "==> Creating admin user..."
node scripts/create-admin.js 2>&1 || echo "Create admin warning (non-fatal)"

echo "==> Starting Next.js server..."
npx next start -p 3001 -H 0.0.0.0 &
NEXT_PID=$!

wait $NEXT_PID
