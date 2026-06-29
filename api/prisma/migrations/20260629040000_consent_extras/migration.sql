-- AlterTable
ALTER TABLE "SignedConsent" ADD COLUMN "emailEnviadoAt" TIMESTAMP(3),
                            ADD COLUMN "firmaManual" BOOLEAN NOT NULL DEFAULT false,
                            ADD COLUMN "expiresAt" TIMESTAMP(3);
