/*
  Warnings:

  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL DEFAULT 'User',
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL DEFAULT 'User',
    ADD COLUMN `phoneNo` VARCHAR(191) NULL;

-- After adding columns with defaults, remove the defaults
ALTER TABLE `User` ALTER COLUMN `firstName` DROP DEFAULT,
    ALTER COLUMN `lastName` DROP DEFAULT;
