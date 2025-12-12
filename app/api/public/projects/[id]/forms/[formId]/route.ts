import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, setDoc, deleteField } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

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

  console.log("Form fetched:" + id)
  return NextResponse.json(snap.data());
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

async function uploadBase64(base64: string, folder: string, public_id: string) {
  const res = await cloudinary.uploader.upload(base64, {
    folder,
    public_id,
  });
  console.log("Cloudinary API call:" + res.secure_url)
  return res.secure_url;
}

function uploadBuffer(buffer: Buffer, folder: string, public_id: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder, public_id },
      (err, result) => {
        if (err || !result) return reject(err);
        resolve(result.secure_url);
        console.log(result.secure_url as string)
      }
    );

    upload.end(buffer);
  });
}


// ---------- PUT ----------
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string; formId: string }> }) {

  const { id, formId } = await context.params;

  const formData = await req.formData();

  // 1. Get JSON data
  const jsonString = formData.get("json");
  if (!jsonString || typeof jsonString !== "string") {
    return NextResponse.json({ error: "Missing JSON" }, { status: 400 });
  }

  //Parse JSON data
  const data: Form = JSON.parse(jsonString);

  // 2. Process generalSection
  const processedGeneral: FormField[] = [];

  for (const field of data.generalSection) {
    const f: any = { ...field };

    const fileKey = `file-${f.fieldId}`;
    const file = formData.get(fileKey) as File | null;

    if (file) {
      // convert File → Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const url = await uploadBuffer(
        buffer,
        `projects/${id}/forms/${formId}`,
        f.fieldId
      );

      f.imgUrl = url;
    }

    processedGeneral.push(f);
  }

  // 3. Process roofSides
  const processedRoofSides: RoofSide[] = [];

  if (Array.isArray(data.roofSides)) {
    for (const side of data.roofSides) {
      const processedSections: FormSection[] = [];

      for (const section of side.sections) {
        const processedFields: FormField[] = [];

        for (const field of section.fields) {
          const f: any = { ...field };

          const fileKey = `file-${f.fieldId}`;
          const file = formData.get(fileKey) as File | null;

          if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const url = await uploadBuffer(
              buffer,
              `projects/${id}/forms/${formId}`,
              f.fieldId
            );

            f.imgUrl = url;
          }

          processedFields.push(f);
        }

        processedSections.push({
          ...section,
          fields: processedFields,
        });
      }

      processedRoofSides.push({
        ...side,
        sections: processedSections,
      });
    }
  }

  // 4. Final doc
  const finalDoc = {
    ...data,
    generalSection: processedGeneral,
    roofSides: processedRoofSides,
  };

  // save to Firestore
  const ref = doc(db, "projects", id, "forms", formId);
  await setDoc(ref, finalDoc, { merge: true });

  return NextResponse.json(finalDoc);
}
