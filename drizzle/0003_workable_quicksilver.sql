CREATE TABLE `invitation_guests` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`name` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitation_guests_order_name` ON `invitation_guests` (`order_id`,`name`);--> statement-breakpoint
CREATE INDEX `invitation_guests_order` ON `invitation_guests` (`order_id`);--> statement-breakpoint
CREATE TABLE `invitation_wishes` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`name` text NOT NULL,
	`message` text NOT NULL,
	`created` integer NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitation_wishes_order_token` ON `invitation_wishes` (`order_id`,`token_hash`);--> statement-breakpoint
CREATE INDEX `invitation_wishes_order_updated` ON `invitation_wishes` (`order_id`,`updated`);