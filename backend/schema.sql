CREATE DATABASE IF NOT EXISTS `sales_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sales_db`;

CREATE TABLE IF NOT EXISTS `lignes_vente` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `date_vente` DATE NOT NULL,
  `nom_produit` VARCHAR(255) NOT NULL,
  `montant_vendu` DECIMAL(15,2) NOT NULL,
  `benefice` DECIMAL(15,2) NOT NULL,
  `cloturee` BOOLEAN NOT NULL DEFAULT FALSE,
  `date_cloture` DATETIME NULL,
  `note` VARCHAR(500) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NULL,
  INDEX `idx_date_vente` (`date_vente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;