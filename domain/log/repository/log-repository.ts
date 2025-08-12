import { db } from '@/lib/db';
import { deviceLogs, DeviceLog, NewDeviceLog } from '../model/log';
import { desc, eq, and, isNull, count } from 'drizzle-orm';

export class LogRepository {
  
  // 새 로그 생성
  async createLog(log: NewDeviceLog): Promise<DeviceLog> {
    const [newLog] = await db.insert(deviceLogs).values(log).returning();
    return newLog;
  }

  // 로그 목록 조회 (페이징 지원)
  async getLogs(
    logType?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ logs: DeviceLog[], total: number }> {
    const offset = (page - 1) * limit;
    
    const whereCondition = logType && logType !== 'all' 
      ? eq(deviceLogs.logType, logType)
      : undefined;

    // 전체 개수 조회
    const [totalResult] = await db
      .select({ count: count() })
      .from(deviceLogs)
      .where(whereCondition);

    // 로그 목록 조회
    const logs = await db
      .select()
      .from(deviceLogs)
      .where(whereCondition)
      .orderBy(desc(deviceLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      logs,
      total: totalResult.count
    };
  }

  // 활성 로그만 조회
  async getActiveLogs(
    logType?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ logs: DeviceLog[], total: number }> {
    const offset = (page - 1) * limit;
    
    const whereConditions = [
      eq(deviceLogs.isActive, 'true'),
      isNull(deviceLogs.resolvedAt)
    ];
    
    if (logType && logType !== 'all') {
      whereConditions.push(eq(deviceLogs.logType, logType));
    }

    // 전체 개수 조회
    const [totalResult] = await db
      .select({ count: count() })
      .from(deviceLogs)
      .where(and(...whereConditions));

    // 로그 목록 조회
    const logs = await db
      .select()
      .from(deviceLogs)
      .where(and(...whereConditions))
      .orderBy(desc(deviceLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      logs,
      total: totalResult.count
    };
  }

  // 로그 해결 처리
  async resolveLog(id: number): Promise<DeviceLog | null> {
    const [resolvedLog] = await db
      .update(deviceLogs)
      .set({
        resolvedAt: new Date(),
        isActive: 'false'
      })
      .where(eq(deviceLogs.id, id))
      .returning();

    return resolvedLog || null;
  }

  // 디바이스별 최신 로그 조회
  async getLatestLogByDevice(deviceName: string, logType: string): Promise<DeviceLog | null> {
    const [log] = await db
      .select()
      .from(deviceLogs)
      .where(and(
        eq(deviceLogs.deviceName, deviceName),
        eq(deviceLogs.logType, logType),
        eq(deviceLogs.isActive, 'true')
      ))
      .orderBy(desc(deviceLogs.createdAt))
      .limit(1);

    return log || null;
  }

  // 중복 로그 방지를 위한 체크
  async hasActiveLog(deviceName: string, logType: string): Promise<boolean> {
    const [result] = await db
      .select({ count: count() })
      .from(deviceLogs)
      .where(and(
        eq(deviceLogs.deviceName, deviceName),
        eq(deviceLogs.logType, logType),
        eq(deviceLogs.isActive, 'true')
      ));

    return result.count > 0;
  }

  // 통계 조회
  async getLogStats(): Promise<{
    total: number;
    healthFailure: number;
    aiFailure: number;
    ocrMismatch: number;
  }> {
    const activeCondition = and(
      eq(deviceLogs.isActive, 'true'),
      isNull(deviceLogs.resolvedAt)
    );

    const [total] = await db
      .select({ count: count() })
      .from(deviceLogs)
      .where(activeCondition);

    const [healthFailure] = await db
      .select({ count: count() })
      .from(deviceLogs)
      .where(and(activeCondition, eq(deviceLogs.logType, 'health_failure')));

    const [aiFailure] = await db
      .select({ count: count() })
      .from(deviceLogs)
      .where(and(activeCondition, eq(deviceLogs.logType, 'ai_failure')));

    const [ocrMismatch] = await db
      .select({ count: count() })
      .from(deviceLogs)
      .where(and(activeCondition, eq(deviceLogs.logType, 'ocr_mismatch')));

    return {
      total: total.count,
      healthFailure: healthFailure.count,
      aiFailure: aiFailure.count,
      ocrMismatch: ocrMismatch.count
    };
  }
}