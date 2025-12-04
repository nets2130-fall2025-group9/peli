import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { Rating } from '@/lib/types';

// POST /ratings/:id/report - report a rating (increments reports count)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseClient();

    // get the current count
    const { data: rating, error: fetchError } = await supabase
      .from('rating')
      .select('reports')
      .eq('id', id)
      .single();

    if (fetchError || !rating) {
      return NextResponse.json(
        { error: 'Rating not found' },
        { status: 404 }
      );
    }

    // increment the reports count
    const newReportsCount = (rating.reports || 0) + 1;

    const { data, error } = await supabase
      .from('rating')
      .update({ reports: newReportsCount })
      .eq('id', id)
      .select(`
        id,
        menu_item_id,
        user_id,
        created_at,
        rating,
        description,
        image_path,
        reports,
        menu_item (
          name,
          dining_hall
        )
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update reports count' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Rating);
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

