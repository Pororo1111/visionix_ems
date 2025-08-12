CREATE TABLE "device_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_name" text NOT NULL,
	"log_type" text NOT NULL,
	"status" text NOT NULL,
	"value" text,
	"instance" text,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"is_active" text DEFAULT 'true' NOT NULL
);
--> statement-breakpoint
CREATE INDEX "device_name_idx" ON "device_logs" USING btree ("device_name");--> statement-breakpoint
CREATE INDEX "log_type_idx" ON "device_logs" USING btree ("log_type");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "device_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "is_active_idx" ON "device_logs" USING btree ("is_active");