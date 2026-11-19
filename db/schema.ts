import {integer,sqliteTable,text} from "drizzle-orm/sqlite-core";
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
