import { NextRequest, NextResponse } from "next/server";
import { PrometheusAPI } from "@/lib/prometheus-api";

const prometheusAPI = new PrometheusAPI();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const ip = searchParams.get("ip");

        let ocrTimeQuery = "ocr_time_value";
        let ocrServerTimestampQuery = "ocr_timestamp_seconds";

        if (ip) {
            ocrTimeQuery = `ocr_time_value{instance="${ip}"}`;
            ocrServerTimestampQuery = `ocr_timestamp_seconds{instance="${ip}"}`;
        }

        const ocrTimePanel = await prometheusAPI.getInstantPanelData({
            id: "ocr-time",
            expr: ocrTimeQuery,
            title: "OCR 시간",
        });

        const ocrServerTimestampPanel = await prometheusAPI.getInstantPanelData({
            id: "ocr-server-timestamp",
            expr: ocrServerTimestampQuery,
            title: "OCR 서버 타임스탬프",
        });

        let ocrTimeData = ocrTimePanel.data || [];
        let ocrServerTimestampData = ocrServerTimestampPanel.data || [];

        // IP 검색이 아닐 경우 상위 10개만 반환
        if (!ip) {
            ocrTimeData = ocrTimeData.slice(0, 10);
            // ocrServerTimestampData는 ocrTimeData에 맞춰 필터링되어야 함
            const instancesInOcrTimeData = new Set(ocrTimeData.map(d => d.metric.instance));
            ocrServerTimestampData = ocrServerTimestampData.filter(d => instancesInOcrTimeData.has(d.metric.instance));
        }

        return NextResponse.json({
            ocrTimePanel: { ...ocrTimePanel, data: ocrTimeData },
            ocrServerTimestampPanel: { ...ocrServerTimestampPanel, data: ocrServerTimestampData },
        });
    } catch (error) {
        console.error("Error fetching OCR data:", error);
        return NextResponse.json(
            { error: "Failed to fetch OCR data" },
            { status: 500 }
        );
    }
}
