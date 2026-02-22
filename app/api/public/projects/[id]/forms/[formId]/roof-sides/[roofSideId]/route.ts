import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { deleteRoofSide } from "@/lib/actions/deleteRoofSide";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; formId: string; roofSideId: string }> }
) {
  const { id, formId, roofSideId } = await context.params;

  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!id || !formId || !roofSideId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    await deleteRoofSide(id, formId, roofSideId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting roof side:", error);
    return NextResponse.json({ error: "Failed to delete roof side" }, { status: 500 });
  }
}