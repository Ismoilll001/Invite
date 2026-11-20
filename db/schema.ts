import {integer,sqliteTable,text,uniqueIndex,index} from "drizzle-orm/sqlite-core";
import type {Invite,Status} from "../app/model";
export const orders=sqliteTable("invitation_orders",{
 id:text().primaryKey(),owner:text().notNull(),slug:text().notNull().unique(),payload:text({mode:"json"}).$type<Invite>().notNull(),
 status:text().$type<Status>().notNull(),photo:text(),receipt:text(),note:text(),demo:integer({mode:"boolean"}).notNull(),revision:text().notNull(),updated:integer().notNull(),
});

export const adminSessions=sqliteTable("admin_sessions",{
 tokenHash:text("token_hash").primaryKey(),proof:text().notNull(),expires:integer().notNull(),
});
export const adminLoginLimits=sqliteTable("admin_login_limits",{
 key:text().primaryKey(),attempts:integer().notNull(),expires:integer().notNull(),
});

export const invitationRsvps=sqliteTable("invitation_rsvps",{
 id:text().primaryKey(),orderId:text("order_id").notNull(),tokenHash:text("token_hash").notNull(),
 name:text().notNull(),attending:integer({mode:"boolean"}).notNull(),guests:integer().notNull(),
 created:integer().notNull(),updated:integer().notNull(),
},table=>[uniqueIndex("invitation_rsvps_order_token").on(table.orderId,table.tokenHash),index("invitation_rsvps_order_updated").on(table.orderId,table.updated)]);
export const rsvpLimits=sqliteTable("rsvp_limits",{
 key:text().primaryKey(),attempts:integer().notNull(),expires:integer().notNull(),
});

export const invitationGuests=sqliteTable("invitation_guests",{
 id:text().primaryKey(),orderId:text("order_id").notNull(),name:text().notNull(),created:integer().notNull(),
},table=>[uniqueIndex("invitation_guests_order_name").on(table.orderId,table.name),index("invitation_guests_order").on(table.orderId)]);
export const invitationWishes=sqliteTable("invitation_wishes",{
 id:text().primaryKey(),orderId:text("order_id").notNull(),tokenHash:text("token_hash").notNull(),name:text().notNull(),message:text().notNull(),created:integer().notNull(),updated:integer().notNull(),
},table=>[uniqueIndex("invitation_wishes_order_token").on(table.orderId,table.tokenHash),index("invitation_wishes_order_updated").on(table.orderId,table.updated)]);
