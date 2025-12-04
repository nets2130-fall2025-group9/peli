import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { updateRatingSchema } from '@/lib/validations';
import { Rating } from '@/lib/types';

// GET /ratings/:id - get a specific rating
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
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
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch rating' },
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

// PUT /ratings/:id - update own rating (auth is required)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const validationResult = updateRatingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.message },
        { status: 400 }
      );
    }

    // use admin client to bypass RLS since we've already validated user via Clerk
    const supabase = createSupabaseClient();

    // verify the rating exists and belongs to the user
    const { data: existingRating, error: fetchError } = await supabase
      .from('rating')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Rating doesn\'t exist' },
        { status: 404 }
      );
    }

    if (existingRating.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own ratings' },
        { status: 403 }
      );
    }

    // update the rating
    // won't update created_at
    const updateData: {
      rating?: number;
      description?: string | null;
      image_path?: string | null;
    } = {};

    if (validationResult.data.rating !== undefined) {
      updateData.rating = validationResult.data.rating;
    }
    if (validationResult.data.description !== undefined) {
      updateData.description = validationResult.data.description;
    }
    if (validationResult.data.image_path !== undefined) {
      updateData.image_path = validationResult.data.image_path;
    }

    const { data, error } = await supabase
      .from('rating')
      .update(updateData)
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
        { error: 'Failed to update rating' },
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

// DELETE /ratings/:id - delete own rating (auth is required)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = createSupabaseClient();

    // verify the rating exists and belongs to the user
    const { data: existingRating, error: fetchError } = await supabase
      .from('rating')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Rating doesn\'t exist' },
        { status: 404 }
      );
    }

    if (existingRating.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own ratings' },
        { status: 403 }
      );
    }

    // delete the rating
    const { error: deleteError } = await supabase
      .from('rating')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete rating' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Rating deleted successfully' });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

