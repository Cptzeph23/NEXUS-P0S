import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, category')
      .limit(5);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      sampleProducts: products,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}