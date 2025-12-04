import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { createRatingSchema } from '@/lib/validations';
import { Rating } from '@/lib/types';

// GET /ratings - get ratings with optional filters or top 10 of the day
export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { searchParams } = new URL(req.url);
    
    // check if we want top 10 of the day
    const topToday = searchParams.get('top_today') === 'true';
    
    // optional filters
    const menuItemId = searchParams.get('menu_item_id');
    const diningHall = searchParams.get('dining_hall');
    const userId = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const minRatingParam = searchParams.get('min_rating');
    const minRating = minRatingParam ? parseInt(minRatingParam, 10) : null;

    // if filtering by dining_hall, first get menu_item_ids
    let menuItemIds: string[] | null = null;
    if (diningHall) {
      const { data: menuItems } = await supabase
        .from('menu_item')
        .select('id')
        .eq('dining_hall', diningHall);
      menuItemIds = menuItems?.map(item => item.id) || [];
      if (menuItemIds.length === 0) {
        return NextResponse.json([]);
      }
    }

    let query = supabase
      .from('rating')
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
      `);

    // apply filters: item id, dining hall, user id, min rating
    if (menuItemId) {
      query = query.eq('menu_item_id', menuItemId);
    }
    
    if (menuItemIds) {
      query = query.in('menu_item_id', menuItemIds);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    if (minRating !== null) {
      query = query.gte('rating', minRating);
    }

    // if top_today is requested, filter to today's ratings
    // using rating's created_at field
    if (topToday) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      query = query
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());
    }

    // order by rating descending and limit
    query = query.order('rating', { ascending: false }).limit(limit);

    const { data } = await query;

    return NextResponse.json(data as Rating[]);
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /ratings - create a new rating (auth is required)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validationResult = createRatingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.message },
        { status: 400 }
      );
    }

    const { menu_item_id, rating, description, image_path } = validationResult.data;

    // use admin client to bypass RLS since we've already validated user via Clerk
    const supabase = createSupabaseClient();

    // insert the rating
    const { data, error } = await supabase
      .from('rating')
      .insert({
        menu_item_id,
        user_id: userId,
        created_at: new Date().toISOString(),
        rating,
        description: description || null,
        image_path: image_path || null,
        reports: 0
      })
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
        { error: 'Failed to create rating' },
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

