import { NextResponse } from 'next/server';
import { PrometheusAPI } from '@/lib/prometheus-api';

const prometheusAPI = new PrometheusAPI();

export async function GET() {
  try {
    const metrics = await prometheusAPI.getMetrics();
    return NextResponse.json({ data: metrics });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
} 