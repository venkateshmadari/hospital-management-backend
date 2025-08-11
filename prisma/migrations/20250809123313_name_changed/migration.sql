/*
  Warnings:

  - You are about to drop the column `specialty` on the `doctors` table. All the data in the column will be lost.
  - Added the required column `speciality` to the `Doctors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `doctors` DROP COLUMN `specialty`,
    ADD COLUMN `speciality` VARCHAR(191) NOT NULL;
