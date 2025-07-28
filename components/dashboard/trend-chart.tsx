"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrometheusPanelData } from "@/lib/prometheus-api";
import {
    ChartContainer,
    ChartResponsiveContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartStyle,
} from "@/components/ui/chart";
import {
    Line,
    LineChart,
    Area,
    AreaChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

interface TrendChartProps {
    panel: PrometheusPanelData;
    className?: string;
}

export function TrendChart({ panel, className }: TrendChartProps) {
    const formatValue = (panel: PrometheusPanelData): string => {
        if (panel.data.length === 0) return "0";

        const result = panel.data[0];

        // query_range 응답 (초기 로드)
        if (result.values && result.values.length > 0) {
            const lastValue = result.values[result.values.length - 1];
            const value = parseFloat(lastValue[1]);
            return isNaN(value) ? "0" : value.toFixed(1);
        }

        // query 응답 (실시간 업데이트) - instant query
        if (result.value) {
            // instant query의 경우 [timestamp, value] 형태
            if (Array.isArray(result.value) && result.value.length === 2) {
                const value = parseFloat(result.value[1]);
                return isNaN(value) ? "0" : value.toFixed(1);
            } else {
                const value = parseFloat(result.value);
                return isNaN(value) ? "0" : value.toFixed(1);
            }
        }

        return "0";
    };

    const getValueColor = (panel: PrometheusPanelData): string => {
        const value = parseFloat(formatValue(panel));

        switch (panel.id) {
            case "normal-rate-trend":
                return value >= 95
                    ? "text-green-600"
                    : value >= 90
                    ? "text-yellow-600"
                    : "text-red-600";
            case "cpu-trend":
                return value >= 85
                    ? "text-red-600"
                    : value >= 70
                    ? "text-yellow-600"
                    : "text-green-600";
            default:
                return "text-gray-900";
        }
    };

    const getUnit = (panel: PrometheusPanelData): string => {
        switch (panel.id) {
            case "normal-rate-trend":
            case "cpu-trend":
                return "%";
            default:
                return "";
        }
    };

    const getIcon = (panel: PrometheusPanelData): string => {
        switch (panel.id) {
            case "normal-rate-trend":
                return "📈";
            case "cpu-trend":
                return "🖥️";
            default:
                return "📊";
        }
    };

    const getChartColor = (panel: PrometheusPanelData): string => {
        const value = parseFloat(formatValue(panel));

        switch (panel.id) {
            case "normal-rate-trend":
                return value >= 95
                    ? "#22c55e"
                    : value >= 90
                    ? "#eab308"
                    : "#ef4444";
            case "cpu-trend":
                return value >= 85
                    ? "#ef4444"
                    : value >= 70
                    ? "#eab308"
                    : "#22c55e";
            default:
                return "#3b82f6";
        }
    };

    // 차트 데이터 변환: range query가 없고 instant query만 있을 때도 차트가 보이도록 보완
    const getChartData = (panel: PrometheusPanelData) => {
        if (panel.data.length === 0) return [];
        const result = panel.data[0];
        // range query의 경우 (시간별 값)
        if (result.values && result.values.length > 0) {
            // 최근 30개 데이터 포인트 사용
            return result.values
                .slice(-30)
                .map(([timestamp, value]: [number, string], index: number) => ({
                    time: new Date(timestamp * 1000).toLocaleTimeString(
                        "ko-KR",
                        {
                            hour: "2-digit",
                            minute: "2-digit",
                        }
                    ),
                    value: parseFloat(value),
                    index: index,
                }));
        }
        // instant query(현재값만)일 때는 차트 데이터 없음 처리
        // (실제 트렌드가 없으므로 차트 미표시)
        return [];
    };

    const chartData = getChartData(panel);
    const chartColor = getChartColor(panel);

    const chartConfig = {
        value: {
            label: panel.title,
            color: chartColor,
        },
    };

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                    <span className="mr-2">{getIcon(panel)}</span>
                    {panel.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    className={`text-2xl font-bold ${getValueColor(
                        panel
                    )} mb-4`}
                >
                    {formatValue(panel)}
                    {getUnit(panel)}
                </div>

                {/* shadcn/ui 차트 */}
                {chartData.length > 0 ? (
                    <div className="h-[200px] w-full">
                        <ChartContainer config={chartConfig}>
                            <ChartResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient
                                            id={`gradient-${panel.id}`}
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor={chartColor}
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor={chartColor}
                                                stopOpacity={0.05}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f0f0f0"
                                    />
                                    <XAxis
                                        dataKey="index"
                                        tickFormatter={(value, index) => {
                                            // 5개 간격으로 라벨 표시
                                            return index % 5 === 0
                                                ? chartData[index]?.time || ""
                                                : "";
                                        }}
                                        tick={{ fontSize: 10 }}
                                        stroke="#888"
                                    />
                                    <YAxis
                                        tickFormatter={(value) =>
                                            `${value}${getUnit(panel)}`
                                        }
                                        tick={{ fontSize: 10 }}
                                        stroke="#888"
                                        domain={
                                            panel.id === "cpu-trend" ||
                                            panel.id === "normal-rate-trend"
                                                ? [0, 100]
                                                : [
                                                      0,
                                                      (dataMax) =>
                                                          Math.max(dataMax, 1),
                                                  ]
                                        }
                                    />
                                    <Tooltip
                                        cursor={{ strokeDasharray: "3 3" }}
                                        formatter={(value: any, name: any) => [
                                            `${value}${getUnit(panel)}`,
                                            name,
                                        ]}
                                        labelFormatter={(
                                            label: any,
                                            payload: any
                                        ) => {
                                            if (payload && payload.length > 0) {
                                                const dataIndex =
                                                    payload[0].payload?.index;
                                                return (
                                                    chartData[dataIndex]
                                                        ?.time || label
                                                );
                                            }
                                            return label;
                                        }}
                                        contentStyle={{
                                            backgroundColor: "white",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            padding: "8px",
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={chartColor}
                                        strokeWidth={2}
                                        fill={`url(#gradient-${panel.id})`}
                                        dot={{
                                            fill: chartColor,
                                            strokeWidth: 2,
                                            r: 4,
                                            stroke: chartColor,
                                            strokeDasharray: "0",
                                        }}
                                        activeDot={{
                                            r: 6,
                                            stroke: chartColor,
                                            strokeWidth: 2,
                                            fill: chartColor,
                                        }}
                                        connectNulls={false}
                                    />
                                </AreaChart>
                            </ChartResponsiveContainer>
                        </ChartContainer>
                        <ChartStyle id={panel.id} config={chartConfig} />
                    </div>
                ) : (
                    <div className="h-[200px] w-full flex items-center justify-center text-gray-500">
                        <div className="text-sm">데이터가 없습니다</div>
                    </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                    {panel.id === "cpu-trend" ||
                    panel.id === "normal-rate-trend"
                        ? chartData.length > 10
                            ? "최근 30분 트렌드 (y축 0~100%)"
                            : "실시간 데이터만 수신 중 (y축 0~100%)"
                        : "실시간 업데이트"}
                </p>
            </CardContent>
        </Card>
    );
}
