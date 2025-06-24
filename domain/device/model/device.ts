import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const device = pgTable('device', {
  device_id: text('device_id').primaryKey(), // 라즈베리파이 고유 ID
  serial_no: text('serial_no').unique(),     // 하드웨어 S/N
  location: text('location'),                // 설치 위치
  status_interval: integer('status_interval'), // 상태 전송 주기(초)
  activated_at: timestamp('activated_at', { withTimezone: true }),   // 설치 시각
  deactivated_at: timestamp('deactivated_at', { withTimezone: true }) // 해제 시각
});

export type Device = typeof device.$inferSelect;
export type NewDevice = typeof device.$inferInsert; 