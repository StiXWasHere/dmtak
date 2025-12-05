import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snap = await getDocs(collection(db, "formTemplates"));

  const templates = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  return NextResponse.json(templates);
}
