import { NextResponse } from 'next/server';
import { LogService } from '@/domain/log/service/log-service';

const logService = new LogService();

// GET - 로그 통계 조회
export async function GET() {
  try {
    const stats = await logService.getLogStats();

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch log stats'
      },
      { status: 500 }
    );
  }
}