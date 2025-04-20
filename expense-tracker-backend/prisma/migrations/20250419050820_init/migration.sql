-- Check and create User table if not exists
CREATE TABLE IF NOT EXISTS `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add unique indexes if they don't exist
SET @dbname = 'expense_tracker';
SET @tablename = 'User';
SET @indexname = 'User_username_key';
SET @sql = IF (
    EXISTS (
        SELECT 1 FROM information_schema.statistics 
        WHERE table_schema = @dbname
        AND table_name = @tablename
        AND index_name = @indexname
    ),
    'SELECT 1',
    'ALTER TABLE `User` ADD UNIQUE INDEX `User_username_key`(`username`)'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @indexname = 'User_email_key';
SET @sql = IF (
    EXISTS (
        SELECT 1 FROM information_schema.statistics 
        WHERE table_schema = @dbname
        AND table_name = @tablename
        AND index_name = @indexname
    ),
    'SELECT 1',
    'ALTER TABLE `User` ADD UNIQUE INDEX `User_email_key`(`email`)'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and create Expense table if not exists
CREATE TABLE IF NOT EXISTS `Expense` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DOUBLE NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NULL,
    `userId` INTEGER NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign key if it doesn't exist
SET @constraintname = 'Expense_userId_fkey';
SET @sql = IF (
    EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = @dbname
        AND table_name = 'Expense'
        AND constraint_name = @constraintname
    ),
    'SELECT 1',
    'ALTER TABLE `Expense` ADD CONSTRAINT `Expense_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
