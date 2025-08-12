'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Box, Text, Sphere, Html } from '@react-three/drei';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';
import { BuildingType, BUILDING_INFO } from '@/types/device';

interface CoordinatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCoordinateSelect: (x: number, z: number, floor: number) => void;
  buildingType: BuildingType;
  currentFloor?: number;
}

// 크로스헤어 컴포넌트
const Crosshair = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* 수평선 */}
    <Box args={[1.0, 0.02, 0.02]} position={[0, 0, 0]}>
      <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
    </Box>
    {/* 수직선 */}
    <Box args={[0.02, 0.02, 1.0]} position={[0, 0, 0]}>
      <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
    </Box>
    {/* 중심점 */}
    <Sphere args={[0.05]} position={[0, 0, 0]}>
      <meshBasicMaterial color="#ff0000" />
    </Sphere>
  </group>
);

// 클릭 가능한 층 컴포넌트
const ClickableFloor = ({ 
  floor, 
  isUnderground, 
  buildingColor, 
  floorHeight,
  isSelected,
  onFloorClick,
  onCoordinateClick
}: { 
  floor: number; 
  isUnderground: boolean; 
  buildingColor: string;
  floorHeight: number;
  isSelected: boolean;
  onFloorClick: (floor: number) => void;
  onCoordinateClick: (x: number, z: number) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    
    if (!isSelected) {
      // 층이 선택되지 않은 상태면 층을 선택
      onFloorClick(floor);
    } else {
      // 층이 선택된 상태면 좌표를 선택
      const point = event.point;
      // 3D 좌표를 0-100 범위로 변환 (-3.8 ~ 3.8 -> 0 ~ 100)
      const x = ((point.x / 3.8) + 1) * 50;
      const z = ((point.z / 3.8) + 1) * 50;
      
      // 범위 제한
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedZ = Math.max(0, Math.min(100, z));
      
      onCoordinateClick(clampedX, clampedZ);
    }
  };

  return (
    <group>
      {/* 클릭 가능한 층 큐브 */}
      <Box 
        ref={meshRef}
        args={[8, 0.3, 8]} 
        position={[0, floorHeight, 0]}
        onClick={handleClick}
      >
        <meshStandardMaterial 
          color={isSelected ? '#3b82f6' : buildingColor}
          opacity={isSelected ? 0.9 : 0.6} 
          transparent 
        />
      </Box>
      
      {/* 층 번호 텍스트 */}
      <Text
        position={[-4.5, floorHeight + 0.8, 0]}
        fontSize={0.4}
        color={isSelected ? "#ffffff" : "#000000"}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {isUnderground ? `B${Math.abs(floor)}` : `${floor}F`}
      </Text>
      
      {/* 선택 상태 표시 */}
      {isSelected && (
        <Text
          position={[-4.5, floorHeight + 0.4, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          클릭해서 좌표 선택
        </Text>
      )}
    </group>
  );
};

// 좌표 미리보기 컴포넌트
const CoordinatePreview = ({ 
  x, 
  z, 
  floorHeight 
}: { 
  x: number; 
  z: number; 
  floorHeight: number; 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.05;
    }
  });

  // 0-100 좌표를 3D 공간으로 변환
  const x3d = ((x - 50) / 50) * 3.8;
  const z3d = ((z - 50) / 50) * 3.8;

  return (
    <group>
      {/* 크로스헤어 */}
      <Crosshair position={[x3d, floorHeight + 0.5, z3d]} />
      
      {/* 회전하는 마커 */}
      <Sphere
        ref={meshRef}
        args={[0.15, 8, 8]}
        position={[x3d, floorHeight + 0.8, z3d]}
      >
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.3} />
      </Sphere>
      
      {/* 좌표 정보 표시 */}
      <Html position={[x3d, floorHeight + 1.2, z3d]} center>
        <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
          X: {x.toFixed(1)}, Z: {z.toFixed(1)}
        </div>
      </Html>
    </group>
  );
};

// 3D 건물 뷰 컴포넌트 (좌표 선택용)
const CoordinatePickerBuilding = ({ 
  buildingType, 
  selectedFloor,
  onFloorSelect,
  onCoordinateSelect,
  previewCoordinate
}: { 
  buildingType: BuildingType;
  selectedFloor: number | null;
  onFloorSelect: (floor: number) => void;
  onCoordinateSelect: (x: number, z: number) => void;
  previewCoordinate?: { x: number; z: number };
}) => {
  const building = BUILDING_INFO[buildingType];
  
  const floors = [];
  
  // 지하층
  for (let i = -building.undergroundFloors; i < 0; i++) {
    floors.push(i);
  }
  
  // 지상층
  for (let i = 1; i <= building.abovegroundFloors; i++) {
    floors.push(i);
  }
  
  return (
    <group>
      {floors.map((floor, index) => {
        const floorHeight = (index - building.undergroundFloors) * 1.0;
        const isSelected = selectedFloor === floor;
        
        return (
          <group key={floor}>
            <ClickableFloor
              floor={floor}
              isUnderground={floor < 0}
              buildingColor={building.color}
              floorHeight={floorHeight}
              isSelected={isSelected}
              onFloorClick={onFloorSelect}
              onCoordinateClick={onCoordinateSelect}
            />
            
            {/* 미리보기 좌표 표시 */}
            {isSelected && previewCoordinate && (
              <CoordinatePreview 
                x={previewCoordinate.x}
                z={previewCoordinate.z}
                floorHeight={floorHeight}
              />
            )}
          </group>
        );
      })}
    </group>
  );
};

export function CoordinatePickerModal({ 
  isOpen, 
  onClose, 
  onCoordinateSelect, 
  buildingType,
  currentFloor = 1
}: CoordinatePickerModalProps) {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(currentFloor);
  const [previewCoordinate, setPreviewCoordinate] = useState<{ x: number; z: number } | undefined>();

  // 모달이 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedFloor(currentFloor);
      setPreviewCoordinate(undefined);
    }
  }, [isOpen, currentFloor]);

  const handleCoordinateClick = useCallback((x: number, z: number) => {
    setPreviewCoordinate({ x, z });
  }, []);

  const handleConfirm = () => {
    if (selectedFloor !== null && previewCoordinate) {
      onCoordinateSelect(previewCoordinate.x, previewCoordinate.z, selectedFloor);
      onClose();
    }
  };

  // 안전한 건물 정보 가져오기
  const building = buildingType ? BUILDING_INFO[buildingType] : null;
  
  // 건물 정보가 없으면 모달을 표시하지 않음
  if (!building) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎯 좌표 선택 - {building.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* 안내 메시지 */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {selectedFloor === null 
                ? "📍 1단계: 원하는 층을 클릭하세요" 
                : previewCoordinate 
                  ? `✅ 2단계 완료: ${selectedFloor < 0 ? `지하 ${Math.abs(selectedFloor)}층` : `${selectedFloor}층`}의 좌표 (${previewCoordinate.x.toFixed(1)}, ${previewCoordinate.z.toFixed(1)}) 선택됨`
                  : `📍 2단계: ${selectedFloor < 0 ? `지하 ${Math.abs(selectedFloor)}층` : `${selectedFloor}층`}에서 원하는 위치를 클릭하세요`
              }
            </div>
          </div>
          
          {/* 3D Canvas */}
          <div className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
            <Canvas
              camera={{ position: [-10, 8, 10], fov: 45 }}
              className="w-full h-full"
            >
              <ambientLight intensity={0.7} />
              <directionalLight position={[15, 15, 5]} intensity={1.2} />
              <pointLight position={[-10, -10, -5]} intensity={0.6} />
              
              <CoordinatePickerBuilding 
                buildingType={buildingType} 
                selectedFloor={selectedFloor}
                onFloorSelect={setSelectedFloor}
                onCoordinateSelect={handleCoordinateClick}
                previewCoordinate={previewCoordinate}
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
          
          {/* 하단 버튼 */}
          <div className="flex justify-between items-center pt-2 border-t">
            <Button variant="outline" onClick={() => setSelectedFloor(null)}>
              🔄 층 선택 다시하기
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button 
                onClick={handleConfirm} 
                disabled={!selectedFloor || !previewCoordinate}
                className="min-w-[120px]"
              >
                {selectedFloor && previewCoordinate 
                  ? "✅ 좌표 적용" 
                  : "좌표를 선택하세요"
                }
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}