import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

// for flexibility, currently users don't need to be logged in to view others' profiles

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;

    const supabase = createSupabaseClient();

    // fetching user info
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, created_at, first_name, last_name, email, updated_at')
      .eq('id', uid)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // fetching ratings
    const { data: ratingsData, error: ratingsError, count } = await supabase
      .from('rating')
      .select('id', { count: 'exact' })
      .eq('user_id', uid);

    if (ratingsError) {
      return NextResponse.json(
        { error: 'Failed to fetch ratings count' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ...userData, ratings_count: count ?? 0 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

