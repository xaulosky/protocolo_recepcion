-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "roles" "Role"[] DEFAULT ARRAY[]::"Role"[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "permisos" TEXT[] DEFAULT ARRAY[]::TEXT[];
