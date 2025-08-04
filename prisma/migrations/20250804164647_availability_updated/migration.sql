-- CreateTable
CREATE TABLE `Avability` (
    `id` VARCHAR(191) NOT NULL,
    `doctorId` VARCHAR(191) NOT NULL,
    `day` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thrusday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `breakStartTime` VARCHAR(191) NOT NULL,
    `breakEndTime` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Avability` ADD CONSTRAINT `Avability_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
