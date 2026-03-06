import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, clerkClient } from "@clerk/nextjs/server";

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
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; formId: string }> }
) {
  const { id, formId } = await context.params;

  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!id || !formId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const formRef = doc(db, "projects", id, "forms", formId);
    const formSnap = await getDoc(formRef);

    if (!formSnap.exists()) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const form = formSnap.data() as any;

    // ensure form belongs to project
    if (form.projectId && form.projectId !== id) {
      return NextResponse.json({ error: "Form does not belong to project" }, { status: 400 });
    }

    // allow admin or owner
    const client = await clerkClient();
    const caller = await client.users.getUser(userId);
    const role = caller.publicMetadata?.role;
    if (!role) {
      return NextResponse.json({ error: "User has no role" }, { status: 403 });
    }
    if (role !== "admin" && form.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteDoc(formRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json({ error: "Failed to delete form" }, { status: 500 });
  }
}
