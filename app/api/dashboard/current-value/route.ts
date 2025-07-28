import { NextRequest, NextResponse } from 'next/server';
import { PrometheusAPI } from '@/lib/prometheus-api';

const prometheusAPI = new PrometheusAPI();

export async function POST(request: NextRequest) {
  try {
    const { expr } = await request.json();
    
    if (!expr) {
      return NextResponse.json(
        { error: 'Missing required parameter: expr' },
        { status: 400 }
      );
    }
    
    const result = await prometheusAPI.getCurrentValue(expr);
    
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error fetching current value:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current value' },
      { status: 500 }
    );
  }
} 