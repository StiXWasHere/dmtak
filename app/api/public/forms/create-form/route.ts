import { NextRequest, NextResponse } from "next/server";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
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
  const { projectId, templateId, title } = body as {
    projectId?: string;
    templateId?: string;
    title?: string;
  };

  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json({ error: "Missing or invalid projectId" }, { status: 400 });
  }

  if (!templateId || typeof templateId !== "string") {
    return NextResponse.json({ error: "Missing or invalid templateId" }, { status: 400 });
  }

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Missing or invalid title" }, { status: 400 });
  }

  // load template
  const templateRef = doc(db, "formTemplates", templateId);
  const templateSnap = await getDoc(templateRef);

  if (!templateSnap.exists()) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const template: FormTemplate = templateSnap.data() as FormTemplate;

  // create new form under the project
  const newFormRef = doc(
    collection(db, "projects", projectId, "forms")
  );

  const newForm: Form = {
    id: newFormRef.id,
    title: title.trim(),
    type: template.type,
    createdAt: Date.now(),
    projectId,
    ownerId: userId,
    ownerName: user.firstName + " " + user.lastName,
    generalSectionTitle: template.generalSectionTitle,
    generalSection: template.generalSection.map(f => ({
      title: f.title,
      fieldId: f.fieldId,
      options: ['Godkänt', 'Ej godkänt', 'Ej aktuellt', 'Avhjälpt'],
      comment: '',
      imgUrl: ''
    }))
  };


  await setDoc(newFormRef, newForm);

  return NextResponse.json(newForm);
}
