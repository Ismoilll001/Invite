CREATE TABLE `invitation_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`slug` text NOT NULL,
	`payload` text NOT NULL,
	`status` text NOT NULL,
	`photo` text,
	`receipt` text,
	`note` text,
	`demo` integer NOT NULL,
	`revision` text NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitation_orders_slug_unique` ON `invitation_orders` (`slug`);