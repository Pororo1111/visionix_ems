CREATE TABLE "device" (
	"device_id" text PRIMARY KEY NOT NULL,
	"serial_no" text,
	"location" text,
	"status_interval" integer,
	"activated_at" timestamp with time zone,
	"deactivated_at" timestamp with time zone,
	CONSTRAINT "device_serial_no_unique" UNIQUE("serial_no")
);
