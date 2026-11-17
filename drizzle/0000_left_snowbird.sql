CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`designer_id` text NOT NULL,
	`business_id` text NOT NULL,
	`number` text NOT NULL,
	`description` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price` integer NOT NULL,
	`tax` integer DEFAULT 0 NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`due_date` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`designer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`business_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`service` text NOT NULL,
	`skills` text DEFAULT '' NOT NULL,
	`budget` integer NOT NULL,
	`deadline` text NOT NULL,
	`attachment` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`sender_id` text NOT NULL,
	`recipient_id` text NOT NULL,
	`project_id` text,
	`job_id` text,
	`body` text NOT NULL,
	`attachment` text DEFAULT '' NOT NULL,
	`read_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`body` text NOT NULL,
	`read_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `portfolio` (
	`id` text PRIMARY KEY NOT NULL,
	`designer_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`image` text DEFAULT '' NOT NULL,
	`services` text DEFAULT '' NOT NULL,
	`client` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`designer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text,
	`business_id` text NOT NULL,
	`designer_id` text NOT NULL,
	`title` text NOT NULL,
	`amount` integer NOT NULL,
	`deadline` text NOT NULL,
	`status` text DEFAULT 'Not Started' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`business_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`designer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`designer_id` text NOT NULL,
	`amount` integer NOT NULL,
	`delivery_days` integer NOT NULL,
	`message` text NOT NULL,
	`attachment` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Submitted' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`designer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`author_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`rating` integer NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`name` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`website` text DEFAULT '' NOT NULL,
	`skills` text DEFAULT '' NOT NULL,
	`services` text DEFAULT '' NOT NULL,
	`experience` integer DEFAULT 0 NOT NULL,
	`starting_price` integer DEFAULT 0 NOT NULL,
	`industry` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`open_to_proposals` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
