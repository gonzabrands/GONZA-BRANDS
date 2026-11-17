CREATE TABLE `legacy_google_accounts` (
	`account_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `legacy_google_accounts_user_id_unique` ON `legacy_google_accounts` (`user_id`);