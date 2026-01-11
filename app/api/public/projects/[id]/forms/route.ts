import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!id) return NextResponse.json({ error: "Missing project ID" }, { status: 400 });

  const formsRef = collection(db, "projects", id, "forms");
  const snap = await getDocs(formsRef);

  const forms = snap.docs.map(doc => ({
    id: doc.id,
    title: doc.data().title,
    projectId: id,
  }));

  return NextResponse.json(forms);
}
