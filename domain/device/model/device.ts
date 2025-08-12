import { pgTable, text, timestamp, integer, real, boolean } from 'drizzle-orm/pg-core';

// 직접 enum 배열 정의 (Drizzle ORM 호환성을 위해)
const buildingTypeValues = ['terminal1', 'terminal1-transport', 'terminal2', 'terminal2-transport', 'concourse'] as const;
const deviceTypeValues = ['sensor', 'camera', 'monitor'] as const;
const deviceStatusValues = ['active', 'inactive'] as const;

export const device = pgTable('device', {
  device_name: text('device_name').primaryKey(), // 디바이스 이름 (고유 식별자)
  ip: text('ip'), // 디바이스 IP 주소
  
  // 기본 정보  
  device_type: text('device_type', { enum: deviceTypeValues }).notNull(), // 디바이스 타입
  status: text('status', { enum: deviceStatusValues }).default('inactive').notNull(), // 디바이스 상태
  
  // 3D 위치 정보
  building_type: text('building_type', { 
    enum: buildingTypeValues
  }).notNull(), // 건물 타입
  floor: integer('floor').notNull(), // 층수 (지하는 음수, 지상은 양수)
  position_x: real('position_x').notNull(), // X 좌표 (0-100 범위)
  position_z: real('position_z').notNull(), // Z 좌표 (0-100 범위)
  
  // 기존 필드 (하위 호환성)
  location: text('location'), // 텍스트 형태 위치 (선택사항, 기존 데이터 호환용)
  
  // 메타 정보
  description: text('description'), // 디바이스 설명
  is_registered_via_3d: boolean('is_registered_via_3d').default(false), // 3D 뷰를 통해 등록되었는지 여부
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(), // 생성일
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(), // 수정일
});

// 타입 추론
export type Device = typeof device.$inferSelect;
export type NewDevice = typeof device.$inferInsert;

// 추출된 타입들 (다른 파일에서 사용할 수 있도록)
export type BuildingTypeDB = typeof buildingTypeValues[number];
export type DeviceTypeDB = typeof deviceTypeValues[number];
export type DeviceStatusDB = typeof deviceStatusValues[number];

// 타입 검증 함수들
export const isBuildingType = (value: string): value is BuildingTypeDB => {
  return buildingTypeValues.includes(value as BuildingTypeDB);
};

export const isDeviceType = (value: string): value is DeviceTypeDB => {
  return deviceTypeValues.includes(value as DeviceTypeDB);
};

export const isDeviceStatus = (value: string): value is DeviceStatusDB => {
  return deviceStatusValues.includes(value as DeviceStatusDB);
};