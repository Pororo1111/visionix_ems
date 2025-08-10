'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text, Sphere } from '@react-three/drei';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as THREE from 'three';

type BuildingType = 'terminal1' | 'terminal1-transport' | 'terminal2' | 'terminal2-transport' | 'concourse';

interface BuildingInfo {
  name: string;
  floors: number;
  undergroundFloors: number;
  abovegroundFloors: number;
  color: string;
  description: string;
}

interface IoTDevice {
  id: string;
  name: string;
  floor: number;
  type: 'sensor' | 'camera' | 'monitor';
  status: 'active' | 'inactive';
  x: number;
  z: number;
}

const BUILDINGS: Record<BuildingType, BuildingInfo> = {
  terminal1: {
    name: '1터미널',
    floors: 5,
    undergroundFloors: 1,
    abovegroundFloors: 4,
    color: '#3b82f6',
    description: '지하 1층, 지상 4층 구조'
  },
  'terminal1-transport': {
    name: '1터미널 교통센터',
    floors: 7,
    undergroundFloors: 3,
    abovegroundFloors: 4,
    color: '#10b981',
    description: '지하 3층, 지상 4층 구조'
  },
  terminal2: {
    name: '2터미널',
    floors: 6,
    undergroundFloors: 1,
    abovegroundFloors: 5,
    color: '#8b5cf6',
    description: '지하 1층, 지상 5층 구조'
  },
  'terminal2-transport': {
    name: '2터미널 교통센터',
    floors: 7,
    undergroundFloors: 3,
    abovegroundFloors: 4,
    color: '#06b6d4',
    description: '지하 3층, 지상 4층 구조'
  },
  concourse: {
    name: '탑승동',
    floors: 6,
    undergroundFloors: 1,
    abovegroundFloors: 5,
    color: '#f59e0b',
    description: '지하 1층, 지상 5층 구조'
  }
};

// 결정론적 랜덤 함수 (Seeded Random)
const seededRandom = (seed: number) => {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const generateIoTDevices = (buildingType: BuildingType): IoTDevice[] => {
  const building = BUILDINGS[buildingType];
  const devices: IoTDevice[] = [];
  
  // 건물 타입을 기반으로 시드 생성 (항상 같은 결과)
  const buildingSeed = buildingType.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  for (let floor = -building.undergroundFloors; floor <= building.abovegroundFloors; floor++) {
    if (floor === 0) continue;
    
    // 층별 시드
    const floorSeed = buildingSeed + floor * 100;
    
    // 결정론적으로 디바이스 수 결정 (3-10개)
    const devicesPerFloor = Math.floor(seededRandom(floorSeed) * 8) + 3;
    
    for (let i = 0; i < devicesPerFloor; i++) {
      const deviceSeed = floorSeed + i;
      
      devices.push({
        id: `${buildingType}-${floor}-${i}`,
        name: `Device-${floor}F-${i + 1}`,
        floor,
        type: (['sensor', 'camera', 'monitor'] as const)[Math.floor(seededRandom(deviceSeed + 1) * 3)],
        status: seededRandom(deviceSeed + 2) > 0.1 ? 'active' : 'inactive',
        x: seededRandom(deviceSeed + 3) * 80 + 10,
        z: seededRandom(deviceSeed + 4) * 80 + 10
      });
    }
  }
  
  return devices;
};

// 3D IoT 디바이스 컴포넌트 (큐브 내부에 정확히 배치)
const IoTDevice3D = ({ 
  device, 
  floorHeight 
}: { 
  device: IoTDevice; 
  floorHeight: number; 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  const color = device.status === 'active' ? '#22c55e' : '#ef4444';
  
  // 큐브 크기가 8x8이므로, 디바이스를 -3.8 ~ 3.8 범위에 배치 (여백 0.2씩)
  const x = ((device.x - 50) / 50) * 3.8; // -3.8 ~ 3.8 범위
  const z = ((device.z - 50) / 50) * 3.8; // -3.8 ~ 3.8 범위
  
  return (
    <Sphere
      ref={meshRef}
      args={[0.08, 8, 8]}
      position={[x, floorHeight + 0.15, z]}
    >
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} />
    </Sphere>
  );
};

// 3D 층 컴포넌트 (더 긴 큐브)
const Floor3D = ({ 
  floor, 
  isUnderground, 
  buildingColor, 
  devices,
  floorHeight,
  isVisible = true
}: { 
  floor: number; 
  isUnderground: boolean; 
  buildingColor: string;
  devices: IoTDevice[];
  floorHeight: number;
  isVisible?: boolean;
}) => {
  const floorDevices = devices.filter(d => d.floor === floor);
  
  if (!isVisible) return null;
  
  return (
    <group>
      {/* 더 긴 층 큐브 (8x8 크기) */}
      <Box args={[8, 0.3, 8]} position={[0, floorHeight, 0]}>
        <meshStandardMaterial 
          color={buildingColor} 
          opacity={0.8} 
          transparent 
        />
      </Box>
      
      {/* 층 번호 텍스트 */}
      <Text
        position={[-4.5, floorHeight + 0.8, 0]}
        fontSize={0.4}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {isUnderground ? `B${Math.abs(floor)}` : `${floor}F`}
      </Text>
      
      {/* 디바이스 수 표시 */}
      <Text
        position={[-4.5, floorHeight + 0.4, 0]}
        fontSize={0.2}
        color="#666666"
        anchorX="center"
        anchorY="middle"
      >
        {floorDevices.length}개 디바이스
      </Text>
      
      {/* IoT 디바이스들 */}
      {floorDevices.map((device) => (
        <IoTDevice3D
          key={device.id}
          device={device}
          floorHeight={floorHeight}
        />
      ))}
    </group>
  );
};

// 3D 건물 뷰 컴포넌트 (층별 선택 지원)
const Building3D = ({ 
  buildingType, 
  devices,
  selectedFloor = null
}: { 
  buildingType: BuildingType;
  devices: IoTDevice[];
  selectedFloor?: number | null;
}) => {
  const building = BUILDINGS[buildingType];
  
  const floors = useMemo(() => {
    const floorList = [];
    
    // 지하층
    for (let i = -building.undergroundFloors; i < 0; i++) {
      floorList.push(i);
    }
    
    // 지상층
    for (let i = 1; i <= building.abovegroundFloors; i++) {
      floorList.push(i);
    }
    
    return floorList;
  }, [building]);
  
  return (
    <group>
      {floors.map((floor, index) => {
        const floorHeight = (index - building.undergroundFloors) * 1.0; // 간격을 1.0으로 증가
        const isVisible = selectedFloor === null || selectedFloor === floor;
        
        return (
          <Floor3D
            key={floor}
            floor={floor}
            isUnderground={floor < 0}
            buildingColor={building.color}
            devices={devices}
            floorHeight={floorHeight}
            isVisible={isVisible}
          />
        );
      })}
    </group>
  );
};

const BuildingView = ({ 
  buildingType, 
  devices,
  selectedFloor,
  onFloorSelect
}: { 
  buildingType: BuildingType;
  devices: IoTDevice[];
  selectedFloor: number | null;
  onFloorSelect: (floor: number | null) => void;
}) => {
  const building = BUILDINGS[buildingType];
  
  // 현재 선택된 층의 디바이스만 필터링
  const visibleDevices = selectedFloor === null 
    ? devices 
    : devices.filter(d => d.floor === selectedFloor);
  
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* 건물 정보 */}
      <div className="shrink-0 p-4 text-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{building.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{building.description}</p>
        
        {/* 층별 선택 버튼들 */}
        <div className="mt-3 flex flex-wrap gap-1 justify-center max-h-20 overflow-y-auto">
          <button
            onClick={() => onFloorSelect(null)}
            className={`px-2 py-1 text-xs rounded ${
              selectedFloor === null 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            전체
          </button>
          
          {/* 지상층 버튼들 */}
          {Array.from({length: building.abovegroundFloors}, (_, i) => i + 1).reverse().map(floor => (
            <button
              key={floor}
              onClick={() => onFloorSelect(floor)}
              className={`px-2 py-1 text-xs rounded ${
                selectedFloor === floor 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              {floor}F ({devices.filter(d => d.floor === floor).length})
            </button>
          ))}
          
          {/* 지하층 버튼들 */}
          {Array.from({length: building.undergroundFloors}, (_, i) => -(i + 1)).map(floor => (
            <button
              key={floor}
              onClick={() => onFloorSelect(floor)}
              className={`px-2 py-1 text-xs rounded ${
                selectedFloor === floor 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              B{Math.abs(floor)} ({devices.filter(d => d.floor === floor).length})
            </button>
          ))}
        </div>
      </div>
      
      {/* 3D Canvas - 화면 전체 활용 */}
      <div className="flex-1 min-h-0 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900">
        <Canvas
          camera={{ position: [-10, 8, 10], fov: 45 }}
          className="w-full h-full"
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[15, 15, 5]} intensity={1.2} />
          <pointLight position={[-10, -10, -5]} intensity={0.6} />
          
          <Building3D 
            buildingType={buildingType} 
            devices={devices} 
            selectedFloor={selectedFloor}
          />
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={8}
            maxDistance={25}
            autoRotate={false}
          />
        </Canvas>
      </div>
      
      {/* 하단 통계 정보 */}
      <div className="shrink-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="font-semibold text-green-600 dark:text-green-400 text-sm">활성 디바이스</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {visibleDevices.filter(d => d.status === 'active').length}
            </div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
            <div className="font-semibold text-red-600 dark:text-red-400 text-sm">비활성 디바이스</div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {visibleDevices.filter(d => d.status === 'inactive').length}
            </div>
          </div>
        </div>
        
        {selectedFloor !== null && (
          <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {selectedFloor < 0 ? `지하 ${Math.abs(selectedFloor)}층` : `${selectedFloor}층`} 선택됨
          </div>
        )}
      </div>
    </div>
  );
};

export function ThreeDView() {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingType>('terminal1');
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // 클라이언트 사이드에서만 실행
  useEffect(() => {
    setIsClient(true);
    setDevices(generateIoTDevices(selectedBuilding));
    setSelectedFloor(null); // 건물 변경 시 층 선택 초기화
  }, [selectedBuilding]);
  
  // 서버 사이드에서는 로딩 표시
  if (!isClient) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏢 인천공항 3D 뷰
          </CardTitle>
          <CardDescription>
            3D 뷰를 로딩 중입니다...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96 bg-gray-100 rounded-lg border flex items-center justify-center">
            <div className="text-gray-500">3D 뷰 준비 중... 🔄</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              🏢 인천공항 3D 뷰
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              각 건물별 층별 구조와 IoT 디바이스 분포를 3D로 확인하세요
            </p>
          </div>
          
          {/* 건물 선택 */}
          <div className="shrink-0">
            <Select value={selectedBuilding} onValueChange={(value) => setSelectedBuilding(value as BuildingType)}>
              <SelectTrigger className="w-full lg:w-64">
                <SelectValue placeholder="건물을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BUILDINGS).map(([key, building]) => (
                  <SelectItem key={key} value={key}>
                    {building.name} ({building.floors}층)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 범례 */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>활성 디바이스</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span>비활성 디바이스</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 border-2 border-gray-300 rounded" style={{backgroundColor: BUILDINGS[selectedBuilding].color}}></div>
              <span>건물 층</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 메인 3D 뷰 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <BuildingView 
          buildingType={selectedBuilding} 
          devices={devices}
          selectedFloor={selectedFloor}
          onFloorSelect={setSelectedFloor}
        />
      </div>
    </div>
  );
}