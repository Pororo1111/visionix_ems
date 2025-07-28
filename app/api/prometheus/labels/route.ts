import { NextRequest, NextResponse } from 'next/server';
import { PrometheusAPI } from '@/lib/prometheus-api';

const prometheusAPI = new PrometheusAPI();

export async function POST(request: NextRequest) {
  try {
    const { labelName } = await request.json();
    
    if (!labelName) {
      return NextResponse.json(
        { error: 'Missing required parameter: labelName' },
        { status: 400 }
      );
    }

    const values = await prometheusAPI.getLabelValues(labelName);
    return NextResponse.json({ data: values });
  } catch (error) {
    console.error('Error fetching label values:', error);
    return NextResponse.json(
      { error: 'Failed to fetch label values' },
      { status: 500 }
    );
  }
} 