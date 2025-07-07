import { NextRequest, NextResponse } from 'next/server';
import { listDevices, registerDevice, removeDevice } from '@/domain/device/service/device.service';
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

// 디바이스 삭제
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId');
    
    if (!deviceId) {
      return NextResponse.json({ error: '디바이스 ID가 필요합니다.' }, { status: 400 });
    }
    
    const success = await removeDevice(deviceId);
    
    if (success) {
      return NextResponse.json({ success: true, message: '디바이스가 삭제되었습니다.' });
    } else {
      return NextResponse.json({ error: '디바이스를 찾을 수 없습니다.' }, { status: 404 });
    }
  } catch (error) {
    console.error('디바이스 삭제 오류:', error);
    return NextResponse.json({ error: '디바이스 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 디바이스 수정/삭제는 id 기반 별도 라우트에서 구현 권장 