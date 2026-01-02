import { NextRequest, NextResponse } from "next/server";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  const client = await clerkClient();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await client.users.getUser(userId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
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
    ownerName: user.firstName + " " + user.lastName,
    forms: [], // empty for now
  };

  await setDoc(newDocRef, newProject);

  return NextResponse.json(newProject);
}
