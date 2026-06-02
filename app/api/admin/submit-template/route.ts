import { NextRequest, NextResponse } from "next/server";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const caller = await client.users.getUser(userId);
  if (caller.publicMetadata.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, type, generalSections, roofSideSections } = body as {
    title: string;
    type: FormTemplate["type"];
    generalSections: FormSectionTemplate[];
    roofSideSections: FormSectionTemplate[];
  };

  if (!title || !type || !generalSections?.length || !roofSideSections?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const newDocRef = doc(collection(db, "formTemplates"));

  const newTemplate: FormTemplate = {
    id: newDocRef.id,
    title,
    type,
    generalSections,
    roofSideSections,
    createdAt: Date.now(),
    ownerId: userId,
  };

  await setDoc(newDocRef, newTemplate);

  return NextResponse.json(newTemplate);
}
