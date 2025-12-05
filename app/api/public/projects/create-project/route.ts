import { NextRequest, NextResponse } from "next/server";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title } = body as { title?: string };

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Missing or invalid title" }, { status: 400 });
  }

  // create a new doc ref with generated id
  const newDocRef = doc(collection(db, "projects"));

  const newProject: Project = {
    id: newDocRef.id,
    title: title.trim(),
    createdAt: Date.now(),
    ownerId: userId,
    forms: [], // empty for now
  };

  await setDoc(newDocRef, newProject);

  return NextResponse.json(newProject);
}
