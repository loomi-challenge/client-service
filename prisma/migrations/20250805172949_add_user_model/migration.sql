-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "profilePicture" TEXT,
    "bankingDetailsId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BankingDetails" (
    "id" TEXT NOT NULL,
    "agency" TEXT NOT NULL,
    "account" TEXT NOT NULL,

    CONSTRAINT "BankingDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_bankingDetailsId_key" ON "public"."User"("bankingDetailsId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_bankingDetailsId_fkey" FOREIGN KEY ("bankingDetailsId") REFERENCES "public"."BankingDetails"("id") ON DELETE SET NULL ON UPDATE CASCADE;
