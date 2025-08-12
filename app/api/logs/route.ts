import { NextRequest, NextResponse } from 'next/server';
import { LogService } from '@/domain/log/service/log-service';

const logService = new LogService();

// GET - 로그 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const logType = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const activeOnly = searchParams.get('activeOnly') !== 'false'; // 기본값: true

    const result = await logService.getLogs(logType, page, limit, activeOnly);

    return NextResponse.json({
      success: true,
      data: result.logs,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch logs'
      },
      { status: 500 }
    );
  }
}

// POST - 새 로그 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceName, logType, status, value, instance, details } = body;

    // 필수 필드 검증
    if (!deviceName || !logType || !status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: deviceName, logType, status'
        },
        { status: 400 }
      );
    }

    // 유효한 logType 검증
    const validLogTypes = ['health_failure', 'ai_failure', 'ocr_mismatch'];
    if (!validLogTypes.includes(logType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid logType. Must be one of: ' + validLogTypes.join(', ')
        },
        { status: 400 }
      );
    }

    const newLog = await logService.createLog({
      deviceName,
      logType,
      status,
      value,
      instance,
      details
    });

    if (!newLog) {
      return NextResponse.json({
        success: true,
        message: 'Log already exists for this device and type',
        data: null
      });
    }

    return NextResponse.json({
      success: true,
      data: newLog
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating log:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create log'
      },
      { status: 500 }
    );
  }
}