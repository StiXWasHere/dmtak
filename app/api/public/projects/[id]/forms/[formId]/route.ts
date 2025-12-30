import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, setDoc, deleteField } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; formId: string }> }
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

// ---------- PUT ----------
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string; formId: string }> }
) {
  const { id, formId } = await context.params;

  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data: Form = await req.json();

  const ref = doc(db, "projects", id, "forms", formId);
  await setDoc(ref, data, { merge: true });

  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return NextResponse.json({ error: "Form not found after update" }, { status: 500 });
  }
  return NextResponse.json(snap.data());
}

