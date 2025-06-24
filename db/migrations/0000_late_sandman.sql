CREATE TABLE "device" (
	"device_id" text PRIMARY KEY NOT NULL,
	"ip" text,
	"location" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"online" boolean DEFAULT false NOT NULL
);
