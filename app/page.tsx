export default function Home() {
  return (
    <div className="w-full h-full flex-1">
      {/* Grafana 대시보드 임베딩. 실제 URL로 교체 필요 */}
      <iframe
        src="http://localhost/grafana/goto/5c-UG7yHR?orgId=1"
        width="100%"
        height="100%"
        style={{ minHeight: '100vh', border: 'none', display: 'block' }}
        title="Grafana Dashboard"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />
    </div>
  );
}
