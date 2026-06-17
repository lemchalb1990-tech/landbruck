#!/bin/sh
set -e

# Override DATABASE_URL with LANDBRUCK_DB_URL to bypass the value baked by Nixpacks
if [ -n "$LANDBRUCK_DB_URL" ]; then
  export DATABASE_URL="$LANDBRUCK_DB_URL"
fi

trap 'kill $NEXT_PID 2>/dev/null; exit 0' TERM INT

echo "==> DATABASE_URL set, starting Next.js server..."
npx next start -p 3000 -H 0.0.0.0 &
NEXT_PID=$!

wait $NEXT_PID
