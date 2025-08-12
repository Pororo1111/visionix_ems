import { NextRequest, NextResponse } from "next/server";
import {
    listDevices,
    getAllDevices,
    registerDevice,
    removeDevice,
    updateDevice,
} from "@/domain/device/service/device.service";
// 디바이스 정보 수정
export async function PUT(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const deviceName = searchParams.get("deviceName");
        if (!deviceName) {
            return NextResponse.json(
                { error: "디바이스 이름이 필요합니다." },
                { status: 400 }
            );
        }
        const data = await req.json();
        const updated = await updateDevice(deviceName, data);
        if (updated) {
            return NextResponse.json({
                success: true,
                message: "디바이스가 수정되었습니다.",
            });
        } else {
            return NextResponse.json(
                { error: "디바이스를 찾을 수 없습니다." },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error("디바이스 수정 오류:", error);
        return NextResponse.json(
            { error: "디바이스 수정 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
import type { DeviceCreateRequest } from "@/domain/device/dto/device.dto";

// 디바이스 목록 조회 (페이징 또는 전체)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all");
    
    if (all === "true") {
        // 전체 디바이스 조회 (3D 뷰용)
        const devices = await getAllDevices();
        return NextResponse.json({ items: devices, total: devices.length });
    } else {
        // 페이징된 디바이스 조회 (기존 방식)
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const result = await listDevices(page, limit);
        return NextResponse.json(result);
    }
}

// 디바이스 생성
export async function POST(req: NextRequest) {
    const data = (await req.json()) as DeviceCreateRequest;
    const result = await registerDevice(data);
    return NextResponse.json(result);
}

// 디바이스 삭제
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const deviceName = searchParams.get("deviceName");

        if (!deviceName) {
            return NextResponse.json(
                { error: "디바이스 이름이 필요합니다." },
                { status: 400 }
            );
        }

        const success = await removeDevice(deviceName);

        if (success) {
            return NextResponse.json({
                success: true,
                message: "디바이스가 삭제되었습니다.",
            });
        } else {
            return NextResponse.json(
                { error: "디바이스를 찾을 수 없습니다." },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error("디바이스 삭제 오류:", error);
        return NextResponse.json(
            { error: "디바이스 삭제 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}

// 디바이스 수정/삭제는 id 기반 별도 라우트에서 구현 권장
