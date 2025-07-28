import { NextRequest, NextResponse } from 'next/server';
import { PrometheusAPI } from '@/lib/prometheus-api';

const prometheusAPI = new PrometheusAPI();

export async function POST(request: NextRequest) {
  try {
    const { expr, start, end } = await request.json();
    
    if (!expr || !start || !end) {
      return NextResponse.json(
        { error: 'Missing required parameters: expr, start, end' },
        { status: 400 }
      );
    }
    
    const result = await prometheusAPI.getPanelData(expr, start, end);
    
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error fetching panel data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch panel data' },
      { status: 500 }
    );
  }
} 