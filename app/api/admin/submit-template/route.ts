import { NextRequest, NextResponse } from "next/server";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ensure admin role
  const client = await clerkClient();
  const caller = await client.users.getUser(userId);
  if (caller.publicMetadata.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, type, generalSectionTitle, generalSection } = body as {
    title: string;
    type: FormTemplate["type"];
    generalSectionTitle: string;
    generalSection: FormFieldTemplate[];
  };

  if (!title || !type || !generalSectionTitle || !generalSection) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Create a new doc reference with an auto-generated ID
  const newDocRef = doc(collection(db, "formTemplates"));

  const newTemplate: FormTemplate = {
    id: newDocRef.id,           // use the generated ID
    title,
    type,
    generalSectionTitle,
    generalSection,
    createdAt: Date.now(),
    ownerId: userId,
  };

  await setDoc(newDocRef, newTemplate);

  return NextResponse.json(newTemplate);
}
