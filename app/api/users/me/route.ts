import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // fetching user info
    const supabase = createSupabaseClient();
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, created_at, first_name, last_name, email, updated_at')
      .eq('id', userId)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // fetch ratings
    const { data: ratingsData, error: ratingsError, count } = await supabase
      .from('rating')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (ratingsError) {
      return NextResponse.json(
        { error: 'Failed to fetch ratings count' },
        { status: 500 }
      );
    }

    // include ratings count in returned payload
    return NextResponse.json({ ...userData, ratings_count: count ?? 0 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

