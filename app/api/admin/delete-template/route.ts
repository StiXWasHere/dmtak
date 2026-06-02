import { NextRequest, NextResponse } from "next/server";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, clerkClient } from "@clerk/nextjs/server";

export async function DELETE(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const caller = await client.users.getUser(userId);
  if (caller.publicMetadata.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { templateId } = await req.json() as { templateId?: string };
  if (!templateId) {
    return NextResponse.json({ error: "Missing templateId" }, { status: 400 });
  }

  await deleteDoc(doc(db, "formTemplates", templateId));

  return NextResponse.json({ success: true });
}
