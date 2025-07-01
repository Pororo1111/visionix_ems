import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const device = pgTable('device', {
  device_id: text('device_id').primaryKey(), // 라즈베리파이 고유 ID
  ip: text('ip'), // 디바이스 IP 주소 추가
  location: text('location'),                // 설치 위치
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(), // 생성일
});

export type Device = typeof device.$inferSelect;
export type NewDevice = typeof device.$inferInsert; 