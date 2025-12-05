import { NextRequest, NextResponse } from "next/server";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = query(
    collection(db, "projects"),
  );

  const snapshot = await getDocs(q);
  const projects = snapshot.docs.map((doc) => doc.data());

  return NextResponse.json(projects);
}
