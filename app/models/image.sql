create table images
(
    `id`              BIGINT(20) AUTO_INCREMENT PRIMARY KEY,
    game_id           int(10)           DEFAULT NULL,
    path	          varchar(255)      DEFAULT NULL,

    `created_at`      DATETIME           DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `game_id` (`game_id`)
) DEFAULT CHARSET = `utf8mb4`
  COLLATE = utf8mb4_unicode_520_ci
  COMMENT = 'For ruby';
