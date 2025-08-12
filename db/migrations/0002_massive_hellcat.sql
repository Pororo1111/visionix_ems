ALTER TABLE "device" RENAME COLUMN "device_id" TO "device_name";--> statement-breakpoint
ALTER TABLE "device" ADD COLUMN "device_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "device" ADD COLUMN "status" text DEFAULT 'inactive' NOT NULL;--> statement-breakpoint
ALTER TABLE "device" ADD COLUMN "building_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "device" ADD COLUMN "floor" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "device" ADD COLUMN "position_x" real NOT NULL;--> statement-breakpoint
ALTER TABLE "device" ADD COLUMN "position_z" real NOT NULL;--> statement-breakpoint
ALTER TABLE "device" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "device" ADD COLUMN "is_registered_via_3d" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "device" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;