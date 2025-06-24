import { NextRequest, NextResponse } from 'next/server';
import { listDevices, registerDevice } from '@/domain/device/service/device.service';
import type { DeviceCreateRequest } from '@/domain/device/dto/device.dto';

// 디바이스 목록 조회
export async function GET() {
  const devices = await listDevices();
  return NextResponse.json(devices);
}

// 디바이스 생성
export async function POST(req: NextRequest) {
  const data = (await req.json()) as DeviceCreateRequest;
  const result = await registerDevice(data);
  return NextResponse.json(result);
}

// 디바이스 수정/삭제는 id 기반 별도 라우트에서 구현 권장 