import { pgTable, text, timestamp, jsonb, serial, index } from 'drizzle-orm/pg-core';

export const deviceLogs = pgTable('device_logs', {
  id: serial('id').primaryKey(),
  deviceName: text('device_name').notNull(),
  logType: text('log_type').notNull(), // 'health_failure', 'ai_failure', 'ocr_mismatch'
  status: text('status').notNull(),
  value: text('value'),
  instance: text('instance'),
  details: jsonb('details'), // 추가 메타데이터
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'), // 문제 해결 시간 (nullable)
  isActive: text('is_active').default('true').notNull(), // 'true' 또는 'false'
}, (table) => ({
  deviceNameIdx: index('device_name_idx').on(table.deviceName),
  logTypeIdx: index('log_type_idx').on(table.logType),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
  isActiveIdx: index('is_active_idx').on(table.isActive),
}));

export type DeviceLog = typeof deviceLogs.$inferSelect;
export type NewDeviceLog = typeof deviceLogs.$inferInsert;