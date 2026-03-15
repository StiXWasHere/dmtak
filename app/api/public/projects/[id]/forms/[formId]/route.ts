import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

function removeUndefinedDeep(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;

  if (Array.isArray(value)) {
    return value.map((item) => {
      const normalized = removeUndefinedDeep(item);
      return normalized === undefined ? null : normalized;
    });
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const cleaned = Object.entries(obj).reduce<Record<string, unknown>>((acc, [key, val]) => {
      const normalized = removeUndefinedDeep(val);
      if (normalized !== undefined) {
        acc[key] = normalized;
      }
      return acc;
    }, {});
    return cleaned;
  }

  return value;
}

function extractPublicId(url: string) {
  try {
    const match = url.match(/\/upload(?:\/[^\/]*)*\/v\d+\/(.+?)\.(?:jpg|jpeg|png|webp|gif|svg|bmp|tiff)(?:$|\?)/i);
    if (match?.[1]) return match[1];

    const fallbackMatch = url.match(/forms\/(.+?)\.(?:jpg|jpeg|png|webp|gif|svg|bmp|tiff)/i);
    return fallbackMatch ? `forms/${fallbackMatch[1]}` : null;
  } catch {
    return null;
  }
}

function collectFormImageUrls(form: Form) {
  const imageUrls = new Set<string>();

  if (Array.isArray(form.generalSection)) {
    form.generalSection.forEach((field) => {
      if (Array.isArray(field.imgUrls)) {
        field.imgUrls.forEach((url) => {
          if (url) imageUrls.add(url);
        });
      }
      if (field.imgUrl) imageUrls.add(field.imgUrl);
    });
  }

  if (Array.isArray(form.roofSides)) {
    form.roofSides.forEach((side) => {
      side.sections?.forEach((section) => {
        section.fields?.forEach((field) => {
          if (Array.isArray(field.imgUrls)) {
            field.imgUrls.forEach((url) => {
              if (url) imageUrls.add(url);
            });
          }
          if (field.imgUrl) imageUrls.add(field.imgUrl);
        });
      });
    });
  }

  return Array.from(imageUrls);
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; formId: string }> }
) {
  const { id, formId } = await context.params;

  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!id || !formId) return NextResponse.json({ error: "Missing project ID or form ID" }, { status: 400 });

  const formRef = doc(db, "projects", id, "forms", formId);
  const snap = await getDoc(formRef);

  if (!snap.exists()) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  return NextResponse.json(snap.data());
}

// ---------- PUT ----------
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string; formId: string }> }
) {
  const { id, formId } = await context.params;

  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = (await req.json()) as Partial<Form>;
  const sanitizedData = removeUndefinedDeep(data);

  if (!sanitizedData || typeof sanitizedData !== "object" || Array.isArray(sanitizedData)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (Object.keys(sanitizedData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const ref = doc(db, "projects", id, "forms", formId);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  await setDoc(ref, sanitizedData, { merge: true });

  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return NextResponse.json({ error: "Form not found after update" }, { status: 500 });
  }
  return NextResponse.json(snap.data());
}
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; formId: string }> }
) {
  const { id, formId } = await context.params;

  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!id || !formId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const formRef = doc(db, "projects", id, "forms", formId);
    const formSnap = await getDoc(formRef);

    if (!formSnap.exists()) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const form = formSnap.data() as any;

    // ensure form belongs to project
    if (form.projectId && form.projectId !== id) {
      return NextResponse.json({ error: "Form does not belong to project" }, { status: 400 });
    }

    // allow admin or owner
    const client = await clerkClient();
    const caller = await client.users.getUser(userId);
    const role = caller.publicMetadata?.role;
    if (!role) {
      return NextResponse.json({ error: "User has no role" }, { status: 403 });
    }
    if (role !== "admin" && form.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const imageUrls = collectFormImageUrls(form as Form);
    const deleteImagePromises: Promise<void>[] = [];

    for (const url of imageUrls) {
      const publicId = extractPublicId(url);
      if (!publicId) continue;

      deleteImagePromises.push(
        (async () => {
          try {
            await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
          } catch (cloudinaryError) {
            console.error("Cloudinary delete failed for", publicId, cloudinaryError);
          }
        })()
      );
    }

    await Promise.all(deleteImagePromises);

    await deleteDoc(formRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json({ error: "Failed to delete form" }, { status: 500 });
  }
}
