import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // <-- await here

  if (!id) {
    console.log("ID provided:", id);
    return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
  }

  const docRef = doc(db, "projects", id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(snapshot.data());
}

