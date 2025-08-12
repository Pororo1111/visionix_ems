import { LogRepository } from '../repository/log-repository';
import { NewDeviceLog, DeviceLog } from '../model/log';

export type LogType = 'health_failure' | 'ai_failure' | 'ocr_mismatch';

export interface LogData {
  deviceName: string;
  logType: LogType;
  status: string;
  value?: string;
  instance?: string;
  details?: any;
}

export class LogService {
  private logRepository: LogRepository;

  constructor() {
    this.logRepository = new LogRepository();
  }

  // 로그 생성 (중복 방지)
  async createLog(logData: LogData): Promise<DeviceLog | null> {
    const { deviceName, logType, status, value, instance, details } = logData;

    // 동일한 디바이스와 타입의 활성 로그가 있는지 확인
    const hasActive = await this.logRepository.hasActiveLog(deviceName, logType);
    
    if (hasActive) {
      // 이미 활성 로그가 있으면 생성하지 않음
      return null;
    }

    const newLog: NewDeviceLog = {
      deviceName,
      logType,
      status,
      value,
      instance,
      details: details ? JSON.parse(JSON.stringify(details)) : null,
    };

    return await this.logRepository.createLog(newLog);
  }

  // 로그 목록 조회
  async getLogs(
    logType?: string,
    page: number = 1,
    limit: number = 10,
    activeOnly: boolean = true
  ): Promise<{ logs: DeviceLog[], total: number, totalPages: number }> {
    const result = activeOnly 
      ? await this.logRepository.getActiveLogs(logType, page, limit)
      : await this.logRepository.getLogs(logType, page, limit);

    return {
      ...result,
      totalPages: Math.ceil(result.total / limit)
    };
  }

  // 로그 해결 처리
  async resolveLog(id: number): Promise<DeviceLog | null> {
    return await this.logRepository.resolveLog(id);
  }

  // 디바이스 로그 해결 (디바이스명과 타입으로)
  async resolveDeviceLog(deviceName: string, logType: LogType): Promise<DeviceLog | null> {
    const latestLog = await this.logRepository.getLatestLogByDevice(deviceName, logType);
    
    if (!latestLog) {
      return null;
    }

    return await this.logRepository.resolveLog(latestLog.id);
  }

  // 로그 통계 조회
  async getLogStats() {
    return await this.logRepository.getLogStats();
  }

  // 프로메테우스 데이터에서 로그 생성
  async processPrometheusData(prometheusData: any[]): Promise<void> {
    const promises: Promise<DeviceLog | null>[] = [];

    // 헬스체크 실패 디바이스 처리
    const deviceHealth = prometheusData.find(d => d.id === 'device-health');
    if (deviceHealth?.data) {
      for (const item of deviceHealth.data) {
        if (item.value && parseFloat(item.value[1]) === 0) {
          const instance = item.metric?.instance || 'unknown';
          promises.push(this.createLog({
            deviceName: instance,
            logType: 'health_failure',
            status: '디바이스 연결 실패',
            value: item.value[1],
            instance: instance,
            details: item.metric
          }));
        }
      }
    }

    // AI 검사 실패 디바이스 처리
    const aiFailedDevices = prometheusData.find(d => d.id === 'ai-failed-devices');
    if (aiFailedDevices?.data) {
      for (const item of aiFailedDevices.data) {
        const instance = item.metric?.instance || 'unknown';
        promises.push(this.createLog({
          deviceName: instance,
          logType: 'ai_failure',
          status: 'AI 검사 실패',
          value: item.value?.[1] || '0',
          instance: instance,
          details: item.metric
        }));
      }
    }

    // OCR 불일치 처리
    const ocrMismatch = prometheusData.find(d => d.id === 'ocr-mismatch-list');
    if (ocrMismatch?.data) {
      for (const item of ocrMismatch.data) {
        const instance = item.metric?.instance || 'unknown';
        promises.push(this.createLog({
          deviceName: instance,
          logType: 'ocr_mismatch',
          status: 'OCR 시간 불일치',
          value: item.value?.[1] || '0',
          instance: instance,
          details: item.metric
        }));
      }
    }

    // 모든 로그 생성 작업 실행
    await Promise.all(promises);
  }

  // 정상 상태로 돌아온 디바이스의 로그 해결
  async resolveNormalizedDevices(prometheusData: any[]): Promise<void> {
    // 현재 정상 상태인 디바이스들 추출
    const healthyDevices = new Set<string>();
    const aiPassedDevices = new Set<string>();
    const ocrNormalDevices = new Set<string>();

    // 헬스체크 정상 디바이스
    const deviceHealth = prometheusData.find(d => d.id === 'device-health');
    if (deviceHealth?.data) {
      for (const item of deviceHealth.data) {
        if (item.value && parseFloat(item.value[1]) > 0) {
          const instance = item.metric?.instance || 'unknown';
          healthyDevices.add(instance);
        }
      }
    }

    // 현재 활성 로그 중 정상 상태로 돌아온 것들 해결
    const activeHealthLogs = await this.logRepository.getActiveLogs('health_failure', 1, 1000);
    for (const log of activeHealthLogs.logs) {
      if (healthyDevices.has(log.deviceName)) {
        await this.resolveLog(log.id);
      }
    }

    // AI 검사 및 OCR 불일치도 유사하게 처리할 수 있음
    // (구체적인 정상 상태 감지 로직은 프로메테우스 데이터 구조에 따라 다름)
  }
}