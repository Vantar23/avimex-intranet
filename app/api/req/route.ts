  
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.execute('SELECT * FROM req_header');
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('[REQ_HEADER_GET]', error);
    return NextResponse.json({ success: false, error: 'Error fetching req_header' }, { status: 500 });
  }
}