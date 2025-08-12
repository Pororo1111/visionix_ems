// 디바이스 관련 타입 정의

// === 기본 타입 정의 ===
// 건물 타입 enum
export const BUILDING_TYPES = {
  TERMINAL1: 'terminal1',
  TERMINAL1_TRANSPORT: 'terminal1-transport', 
  TERMINAL2: 'terminal2',
  TERMINAL2_TRANSPORT: 'terminal2-transport',
  CONCOURSE: 'concourse'
} as const;

export type BuildingType = typeof BUILDING_TYPES[keyof typeof BUILDING_TYPES];

// 디바이스 타입 enum
export const DEVICE_TYPES = {
  SENSOR: 'sensor',
  CAMERA: 'camera', 
  MONITOR: 'monitor'
} as const;

export type DeviceType = typeof DEVICE_TYPES[keyof typeof DEVICE_TYPES];

// 디바이스 상태 enum
export const DEVICE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const;

export type DeviceStatus = typeof DEVICE_STATUS[keyof typeof DEVICE_STATUS];

// === 배열 형태 (드롭다운, 검증 등에 사용) ===
export const BUILDING_TYPE_VALUES = Object.values(BUILDING_TYPES);
export const DEVICE_TYPE_VALUES = Object.values(DEVICE_TYPES);
export const DEVICE_STATUS_VALUES = Object.values(DEVICE_STATUS);

// 건물 정보 매핑
export interface BuildingInfo {
  name: string;
  floors: number;
  undergroundFloors: number;
  abovegroundFloors: number;
  color: string;
  description: string;
}

export const BUILDING_INFO: Record<BuildingType, BuildingInfo> = {
  [BUILDING_TYPES.TERMINAL1]: {
    name: '1터미널',
    floors: 5,
    undergroundFloors: 1,
    abovegroundFloors: 4,
    color: '#3b82f6',
    description: '지하 1층, 지상 4층 구조'
  },
  [BUILDING_TYPES.TERMINAL1_TRANSPORT]: {
    name: '1터미널 교통센터',
    floors: 7,
    undergroundFloors: 3,
    abovegroundFloors: 4,
    color: '#10b981',
    description: '지하 3층, 지상 4층 구조'
  },
  [BUILDING_TYPES.TERMINAL2]: {
    name: '2터미널',
    floors: 6,
    undergroundFloors: 1,
    abovegroundFloors: 5,
    color: '#8b5cf6',
    description: '지하 1층, 지상 5층 구조'
  },
  [BUILDING_TYPES.TERMINAL2_TRANSPORT]: {
    name: '2터미널 교통센터',
    floors: 7,
    undergroundFloors: 3,
    abovegroundFloors: 4,
    color: '#06b6d4',
    description: '지하 3층, 지상 4층 구조'
  },
  [BUILDING_TYPES.CONCOURSE]: {
    name: '탑승동',
    floors: 6,
    undergroundFloors: 1,
    abovegroundFloors: 5,
    color: '#f59e0b',
    description: '지하 1층, 지상 5층 구조'
  }
};

// 디바이스 타입별 한국어 레이블
export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  [DEVICE_TYPES.SENSOR]: '센서',
  [DEVICE_TYPES.CAMERA]: '카메라', 
  [DEVICE_TYPES.MONITOR]: '모니터'
};

// 디바이스 상태별 한국어 레이블
export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  [DEVICE_STATUS.ACTIVE]: '활성',
  [DEVICE_STATUS.INACTIVE]: '비활성'
};

// 유틸리티 함수들
export const getBuildingName = (buildingType: BuildingType): string => {
  return BUILDING_INFO[buildingType]?.name || buildingType;
};

export const getDeviceTypeLabel = (deviceType: DeviceType): string => {
  return DEVICE_TYPE_LABELS[deviceType] || deviceType;
};

export const getDeviceStatusLabel = (status: DeviceStatus): string => {
  return DEVICE_STATUS_LABELS[status] || status;
};

export const getFloorDisplay = (floor: number): string => {
  return floor < 0 ? `B${Math.abs(floor)}` : `${floor}F`;
};

// === 타입 검증 함수들 ===
export const isBuildingType = (value: string): value is BuildingType => {
  return BUILDING_TYPE_VALUES.includes(value as BuildingType);
};

export const isDeviceType = (value: string): value is DeviceType => {
  return DEVICE_TYPE_VALUES.includes(value as DeviceType);
};

export const isDeviceStatus = (value: string): value is DeviceStatus => {
  return DEVICE_STATUS_VALUES.includes(value as DeviceStatus);
};

// === 타입 변환 헬퍼 함수들 ===
export const safeGetBuildingType = (value: string): BuildingType | null => {
  return isBuildingType(value) ? value : null;
};

export const safeGetDeviceType = (value: string): DeviceType | null => {
  return isDeviceType(value) ? value : null;
};

export const safeGetDeviceStatus = (value: string): DeviceStatus | null => {
  return isDeviceStatus(value) ? value : null;
};