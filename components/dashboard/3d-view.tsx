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
    floors: 6,
    undergroundFloors: 2,
    abovegroundFloors: 4,
    color: '#3b82f6',
    description: '지하 2층, 지상 4층 구조'
  },
  'terminal1-transport': {
    name: '1터미널 교통센터',
    floors: 8,
    undergroundFloors: 4,
    abovegroundFloors: 4,
    color: '#10b981',
    description: '지하 4층, 지상 4층 구조'
  },
  terminal2: {
    name: '2터미널',
    floors: 7,
    undergroundFloors: 2,
    abovegroundFloors: 5,
    color: '#8b5cf6',
    description: '지하 2층, 지상 5층 구조'
  },
  'terminal2-transport': {
    name: '2터미널 교통센터',
    floors: 8,
    undergroundFloors: 4,
    abovegroundFloors: 4,
    color: '#06b6d4',
    description: '지하 4층, 지상 4층 구조'
  },
  concourse: {
    name: '탑승동',
    floors: 7,
    undergroundFloors: 2,
    abovegroundFloors: 5,
    color: '#f59e0b',
    description: '지하 2층, 지상 5층 구조'
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

// 3D IoT 디바이스 컴포넌트
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
  const x = (device.x - 50) * 0.1; // -2.5 ~ 2.5 범위로 변환
  const z = (device.z - 50) * 0.1; // -2.5 ~ 2.5 범위로 변환
  
  return (
    <Sphere
      ref={meshRef}
      args={[0.1, 8, 8]}
      position={[x, floorHeight + 0.1, z]}
    >
      <meshStandardMaterial color={color} />
    </Sphere>
  );
};

// 3D 층 컴포넌트
const Floor3D = ({ 
  floor, 
  isUnderground, 
  buildingColor, 
  devices,
  floorHeight 
}: { 
  floor: number; 
  isUnderground: boolean; 
  buildingColor: string;
  devices: IoTDevice[];
  floorHeight: number;
}) => {
  const floorDevices = devices.filter(d => d.floor === floor);
  
  return (
    <group>
      {/* 층 큐브 */}
      <Box args={[5, 0.2, 5]} position={[0, floorHeight, 0]}>
        <meshStandardMaterial color={buildingColor} opacity={0.7} transparent />
      </Box>
      
      {/* 층 번호 텍스트 */}
      <Text
        position={[2.8, floorHeight + 0.5, 0]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {isUnderground ? `B${Math.abs(floor)}` : `${floor}F`}
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

// 3D 건물 뷰 컴포넌트
const Building3D = ({ 
  buildingType, 
  devices 
}: { 
  buildingType: BuildingType;
  devices: IoTDevice[];
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
        const floorHeight = (index - building.undergroundFloors) * 0.8; // 0.8 간격으로 층 배치
        
        return (
          <Floor3D
            key={floor}
            floor={floor}
            isUnderground={floor < 0}
            buildingColor={building.color}
            devices={devices}
            floorHeight={floorHeight}
          />
        );
      })}
    </group>
  );
};

const BuildingView = ({ 
  buildingType, 
  devices 
}: { 
  buildingType: BuildingType;
  devices: IoTDevice[];
}) => {
  const building = BUILDINGS[buildingType];
  
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* 건물 정보 */}
      <div className="shrink-0 p-4 text-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{building.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{building.description}</p>
      </div>
      
      {/* 3D Canvas - 화면 전체 활용 */}
      <div className="flex-1 min-h-0 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900">
        <Canvas
          camera={{ position: [8, 6, 8], fov: 45 }}
          className="w-full h-full"
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          
          <Building3D buildingType={buildingType} devices={devices} />
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={20}
            autoRotate={true}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>
      
      {/* 하단 통계 정보 */}
      <div className="shrink-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="font-semibold text-green-600 dark:text-green-400 text-sm">활성 디바이스</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {devices.filter(d => d.status === 'active').length}
            </div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
            <div className="font-semibold text-red-600 dark:text-red-400 text-sm">비활성 디바이스</div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {devices.filter(d => d.status === 'inactive').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function ThreeDView() {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingType>('terminal1');
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  // 클라이언트 사이드에서만 실행
  useEffect(() => {
    setIsClient(true);
    setDevices(generateIoTDevices(selectedBuilding));
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
        <BuildingView buildingType={selectedBuilding} devices={devices} />
      </div>
    </div>
  );
}