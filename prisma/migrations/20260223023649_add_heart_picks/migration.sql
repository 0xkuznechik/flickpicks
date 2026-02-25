-- CreateTable
CREATE TABLE "HeartPick" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryKey" TEXT NOT NULL,
    "nominee" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeartPick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeartPick_userId_idx" ON "HeartPick"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HeartPick_userId_categoryKey_key" ON "HeartPick"("userId", "categoryKey");

-- AddForeignKey
ALTER TABLE "HeartPick" ADD CONSTRAINT "HeartPick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
