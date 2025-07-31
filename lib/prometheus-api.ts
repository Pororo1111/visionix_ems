export interface PrometheusQueryResult {
    status: string;
    data: {
        resultType: string;
        result: Array<{
            metric: Record<string, string>;
            value?: [number, string];
            values?: Array<[number, string]>;
        }>;
    };
}

export interface PrometheusPanelData {
    id: string;
    title: string;
    data: any[];
    value?: string | number;
    unit?: string;
}

export class PrometheusAPI {
    private baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl =
            baseUrl || process.env.PROMETHEUS_URL || "http://localhost:9090";
    }

    async getPanelData(
        expr: string,
        start: string,
        end: string,
        step: string = "15s"
    ): Promise<PrometheusQueryResult> {
        const params = new URLSearchParams({
            query: expr,
            start,
            end,
            step,
        });

        const response = await fetch(
            `${this.baseUrl}/api/v1/query_range?${params}`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch panel data: ${response.statusText}`
            );
        }

        return response.json();
    }

    async getCurrentValue(expr: string): Promise<PrometheusQueryResult> {
        const params = new URLSearchParams({ query: expr });

        const response = await fetch(`${this.baseUrl}/api/v1/query?${params}`);

        if (!response.ok) {
            throw new Error(
                `Failed to fetch current value: ${response.statusText}`
            );
        }

        return response.json();
    }

    async getMultiplePanelData(
        queries: Array<{ id: string; expr: string; title: string }>,
        start: string,
        end: string
    ): Promise<PrometheusPanelData[]> {
        const results = await Promise.all(
            queries.map(async (query) => {
                try {
                    // 트렌드 패널은 range query 사용, 나머지는 instant query
                    if (
                        query.id === "normal-rate-trend" ||
                        query.id === "cpu-trend"
                    ) {
                        // step을 60초(1분)로 고정
                        const data = await this.getPanelData(
                            query.expr,
                            start,
                            end,
                            "60s"
                        );
                        return {
                            id: query.id,
                            title: query.title,
                            data: data.data.result || [],
                        };
                    } else {
                        const data = await this.getCurrentValue(query.expr);
                        return {
                            id: query.id,
                            title: query.title,
                            data: data.data.result || [],
                        };
                    }
                } catch (error) {
                    console.error(
                        `Error fetching data for ${query.id}:`,
                        error
                    );
                    return {
                        id: query.id,
                        title: query.title,
                        data: [],
                    };
                }
            })
        );
        return results;
    }

    // instant query인지 확인하는 메서드
    private isInstantQuery(expr: string): boolean {
        const instantQueryPatterns = [
            /^up\b/,
            /^count\b/,
            /^sum\b/,
            /^avg\b/,
            /^topk\b/,
            /^app_status\s*==\s*0/,
            /^system_cpu_percent\s*>\s*\d+/,
            /^count\(/,
            /^sum\(/,
            /^avg\(/,
            /^\(sum\(/,
            /^\(count\(/,
        ];

        return instantQueryPatterns.some((pattern) => pattern.test(expr));
    }

    // 메트릭 목록 조회
    async getMetrics(): Promise<string[]> {
        const response = await fetch(
            `${this.baseUrl}/api/v1/label/__name__/values`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch metrics: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data || [];
    }

    // 라벨 값 조회
    async getLabelValues(labelName: string): Promise<string[]> {
        const response = await fetch(
            `${this.baseUrl}/api/v1/label/${labelName}/values`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch label values: ${response.statusText}`
            );
        }

        const result = await response.json();
        return result.data || [];
    }

    async getInstantPanelData(
        query: { id: string; expr: string; title: string }
    ): Promise<PrometheusPanelData> {
        try {
            const data = await this.getCurrentValue(query.expr);
            return {
                id: query.id,
                title: query.title,
                data: data.data.result || [],
            };
        } catch (error) {
            console.error(
                `Error fetching instant panel data for ${query.id}:`,
                error
            );
            return {
                id: query.id,
                title: query.title,
                data: [],
            };
        }
    }
}
