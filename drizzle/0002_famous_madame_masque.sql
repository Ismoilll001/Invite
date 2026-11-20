CREATE TABLE `invitation_rsvps` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`name` text NOT NULL,
	`attending` integer NOT NULL,
	`guests` integer NOT NULL,
	`created` integer NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitation_rsvps_order_token` ON `invitation_rsvps` (`order_id`,`token_hash`);--> statement-breakpoint
CREATE INDEX `invitation_rsvps_order_updated` ON `invitation_rsvps` (`order_id`,`updated`);--> statement-breakpoint
CREATE TABLE `rsvp_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`expires` integer NOT NULL
);
