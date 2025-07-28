"use client";
import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeviceEditFormProps {
    device: {
        device_id: string;
        ip: string;
        location: string;
    };
    onUpdated?: () => void;
    onCancel?: () => void;
}

export default function DeviceEditForm({
    device,
    onUpdated,
    onCancel,
}: DeviceEditFormProps) {
    const [form, setForm] = useState({
        device_id: device.device_id,
        ip: device.ip,
        location: device.location,
    });
    const [loading, startTransition] = useTransition();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch(`/api/device?deviceId=${form.device_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (onUpdated) startTransition(() => onUpdated());
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-white dark:bg-gray-900"
        >
            <div>
                <Label htmlFor="device_id">Device ID</Label>
                <Input
                    id="device_id"
                    name="device_id"
                    value={form.device_id}
                    disabled
                />
            </div>
            <div>
                <Label htmlFor="ip">IP 주소</Label>
                <Input
                    id="ip"
                    name="ip"
                    value={form.ip}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="col-span-2">
                <Label htmlFor="location">설치 위치</Label>
                <Input
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    취소
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "수정 중..." : "수정 완료"}
                </Button>
            </div>
        </form>
    );
}
