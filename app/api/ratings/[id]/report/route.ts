import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";

const REPORT_THRESHOLD = 10;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminSupabaseClient();

    const { data: rating, error: fetchError } = await supabase
      .from("rating")
      .select("reports")
      .eq("id", id)
      .single();

    if (fetchError || !rating) {
      return NextResponse.json({ error: "Rating not found" }, { status: 404 });
    }

    const newReportsCount = (rating.reports || 0) + 1;

    if (newReportsCount > REPORT_THRESHOLD) {
      const { error: deleteError } = await supabase
        .from("rating")
        .delete()
        .eq("id", id);

      if (deleteError) {
        return NextResponse.json(
          { error: "Failed to delete rating" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Rating reported and removed",
        deleted: true,
      });
    }

    const { error: updateError } = await supabase
      .from("rating")
      .update({ reports: newReportsCount })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to report rating" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Rating reported successfully",
      reports: newReportsCount,
      deleted: false,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
