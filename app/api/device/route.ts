import { NextRequest, NextResponse } from 'next/server';
import { listDevices, registerDevice } from '@/domain/device/service/device.service';
import type { DeviceCreateRequest } from '@/domain/device/dto/device.dto';

// 디바이스 목록 조회 (페이징)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const result = await listDevices(page, limit);
  return NextResponse.json(result);
}

// 디바이스 생성
export async function POST(req: NextRequest) {
  const data = (await req.json()) as DeviceCreateRequest;
  const result = await registerDevice(data);
  return NextResponse.json(result);
}

// 디바이스 수정/삭제는 id 기반 별도 라우트에서 구현 권장 