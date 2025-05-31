/*
  Warnings:

  - The `expected` column on the `TestCaseResult` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TestCaseResult" DROP COLUMN "expected",
ADD COLUMN     "expected" TEXT[];
