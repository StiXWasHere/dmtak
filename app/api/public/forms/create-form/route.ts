import { NextRequest, NextResponse } from "next/server";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

const DEFAULT_OPTIONS: FormField["options"] = [
  'Godkänt', 'Ej godkänt', 'Ej aktuellt', 'Avhjälpt', 'Ej utförd',
];

function expandField(f: FormFieldTemplate): FormField {
  return {
    title: f.title,
    fieldId: crypto.randomUUID(),
    options: DEFAULT_OPTIONS,
    comment: '',
    imgUrls: [],
  };
}

function expandSection(sec: FormSectionTemplate): FormSection {
  return {
    id: crypto.randomUUID(),
    title: sec.title,
    fields: sec.fields.map(expandField),
  };
}

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
  const { projectId, templateId, title, customerParticipants, workerParticipants } = body as {
    projectId?: string;
    templateId?: string;
    title?: string;
    customerParticipants?: string;
    workerParticipants?: string;
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

  const templateRef = doc(db, "formTemplates", templateId);
  const templateSnap = await getDoc(templateRef);
  if (!templateSnap.exists()) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const template = templateSnap.data() as FormTemplate;

  const newFormRef = doc(collection(db, "projects", projectId, "forms"));

  const trimmedCustomer = customerParticipants?.trim();
  const trimmedWorker = workerParticipants?.trim();

  // Build the form, supporting both new multi-section templates and legacy flat templates
  const newForm: Form = {
    id: newFormRef.id,
    title: title.trim(),
    type: template.type,
    createdAt: Date.now(),
    projectId,
    ownerId: userId,
    ownerName: user.firstName + " " + user.lastName,
    ...(trimmedCustomer ? { customerParticipants: trimmedCustomer } : {}),
    ...(trimmedWorker ? { workerParticipants: trimmedWorker } : {}),

    // New multi-section structure
    ...(template.generalSections?.length
      ? { generalSections: template.generalSections.map(expandSection) }
      : {
          // Legacy flat structure
          generalSectionTitle: template.generalSectionTitle ?? "",
          generalSection: (template.generalSection ?? []).map((f) => ({
            title: f.title,
            fieldId: f.fieldId,
            options: DEFAULT_OPTIONS,
            comment: '',
            imgUrls: [],
          })),
        }
    ),

    // Roof side section template — stored on the form so new sides can be created without re-fetching the template
    ...(template.roofSideSections?.length
      ? {
          roofSideSectionTemplate: template.roofSideSections.map((sec) => ({
            id: sec.id,
            title: sec.title,
            fields: sec.fields.map((f) => ({
              title: f.title,
              fieldId: f.fieldId,
              options: DEFAULT_OPTIONS,
              comment: '',
              imgUrls: [],
            })),
          })),
        }
      : {}
    ),
  };

  await setDoc(newFormRef, newForm);

  return NextResponse.json(newForm);
}
