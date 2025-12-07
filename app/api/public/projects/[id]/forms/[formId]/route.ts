import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(
  req: NextRequest,
  context: { params: { id: string; formId: string } } | { params: Promise<{ id: string; formId: string }> }
) {
  const { id, formId } = await context.params;

  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!id || !formId) return NextResponse.json({ error: "Missing project ID or form ID" }, { status: 400 });

  const formRef = doc(db, "projects", id, "forms", formId);
  const snap = await getDoc(formRef);

  if (!snap.exists()) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  return NextResponse.json(snap.data());
}
