import { NextRequest, NextResponse } from 'next/server';
import { getAllDeviceIps } from '@/domain/device/service/device.service';

export async function GET(req: NextRequest) {
  try {
    const ips = await getAllDeviceIps();
    const targets = ips.map(ip => ({
      targets: [`${ip}:5000`],
      labels: { group: 'device' }
    }));
    return NextResponse.json(targets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch device IPs' }, { status: 500 });
  }
} 