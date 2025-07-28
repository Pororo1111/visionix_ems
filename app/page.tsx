import { PrometheusAPI, PrometheusPanelData } from '@/lib/prometheus-api';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

const prometheusAPI = new PrometheusAPI();

async function getInitialDashboardData(): Promise<PrometheusPanelData[]> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
  
  const queries = [
    // 기본 통계 패널들
    { id: 'total-devices', expr: 'count(app_status)', title: '전체 디바이스 수' },
    { id: 'normal-devices', expr: 'sum(app_status)', title: 'AI 검사 정상 디바이스 수' },
    { id: 'abnormal-devices', expr: 'count(app_status) - sum(app_status)', title: 'AI 검사 비정상 디바이스 수' },
    { id: 'normal-rate', expr: '(sum(app_status) / count(app_status)) * 100', title: '정상률' },
    
    // 시스템 리소스 패널들
    { id: 'avg-cpu', expr: 'avg(system_cpu_percent)', title: '평균 CPU 사용률' },
    { id: 'avg-memory', expr: 'avg(system_memory_percent)', title: '평균 메모리 사용률' },
    { id: 'avg-disk', expr: 'avg(system_disk_usage_percent)', title: '평균 디스크 사용률' },
    { id: 'cpu-over-85', expr: 'count(system_cpu_percent > 85)', title: 'CPU 85% 초과 디바이스 수' },
    
    // 트렌드 차트
    { id: 'normal-rate-trend', expr: '(sum(app_status) / count(app_status)) * 100', title: 'AI 검사 정상 비율 트렌드' },
    { id: 'cpu-trend', expr: 'avg(system_cpu_percent)', title: '평균 CPU 사용률 트렌드' },
    
    // 디바이스 테이블들
    { id: 'cpu-top-20', expr: 'topk(20, system_cpu_percent)', title: 'CPU 사용률 상위 20개 디바이스' },
    { id: 'memory-top-20', expr: 'topk(20, system_memory_percent)', title: '메모리 사용률 상위 20개 디바이스' },
    { id: 'ai-failed-devices', expr: 'app_status == 0', title: 'AI 검사 실패 디바이스 목록' },
    { id: 'device-health', expr: 'up{job="devices"}', title: '전체 디바이스 헬스체크 상태' }
  ];

  try {
    const initialData = await prometheusAPI.getMultiplePanelData(
      queries,
      oneHourAgo.toISOString(),
      now.toISOString()
    );
    return initialData;
  } catch (error) {
    console.error('Error fetching initial dashboard data:', error);
    
    // 에러 시 기본 데이터 반환
    return queries.map(query => ({
      id: query.id,
      title: query.title,
      data: []
    }));
  }
}

export default async function Home() {
  const initialData = await getInitialDashboardData();
  const initialTime = new Date().toISOString();

  return (
    <div className="w-full h-full flex-1 p-6">
      <DashboardClient initialData={initialData} initialTime={initialTime} />
    </div>
  );
}
