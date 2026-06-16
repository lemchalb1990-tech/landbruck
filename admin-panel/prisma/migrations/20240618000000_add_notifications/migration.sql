CREATE TABLE IF NOT EXISTS "Notification" (
  "id"         SERIAL PRIMARY KEY,
  "customerId" INTEGER NOT NULL REFERENCES "Customer"("id") ON DELETE CASCADE,
  "type"       TEXT NOT NULL,
  "title"      TEXT NOT NULL,
  "body"       TEXT NOT NULL,
  "read"       BOOLEAN NOT NULL DEFAULT false,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
