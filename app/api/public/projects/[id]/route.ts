import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    console.log("ID provided:", id);
    return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
  }

  const docRef = doc(db, "projects", id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(snapshot.data());
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
  }

  try {
    const docRef = doc(db, "projects", id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = snapshot.data() as any;

    // allow admin or owner
    const client = await clerkClient();
    const caller = await client.users.getUser(userId);
    const role = caller.publicMetadata?.role;
    if (role !== "admin" && project.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Cascade-delete forms subcollection and any linked Cloudinary images
    try {
      const formsCol = collection(db, "projects", id, "forms");
      const formsSnap = await getDocs(formsCol);
      const deletePromises: Promise<any>[] = [];

      const extractPublicId = (url: string) => {
        try {
          const m = url.match(/\/upload(?:\/[^\/]*)*\/v\d+\/(.+?)\.(?:jpg|jpeg|png|webp|gif|svg|bmp|tiff)(?:$|\?)/i);
          if (m && m[1]) return m[1];
          // fallback: try to capture after "forms/"
          const m2 = url.match(/forms\/(.+?)\.(?:jpg|jpeg|png|webp|gif|svg|bmp|tiff)/i);
          return m2 ? `forms/${m2[1]}` : null;
        } catch (e) {
          return null;
        }
      };

      for (const fdoc of formsSnap.docs) {
        const data = fdoc.data() as any;

        // collect image urls from form fields
        const imageUrls = new Set<string>();
        if (Array.isArray(data.generalSection)) {
          data.generalSection.forEach((field: any) => {
            if (Array.isArray(field?.imgUrls)) {
              field.imgUrls.forEach((url: string) => {
                if (url) imageUrls.add(url);
              });
            }
            if (field?.imgUrl) imageUrls.add(field.imgUrl);
          });
        }
        if (Array.isArray(data.roofSides)) {
          data.roofSides.forEach((side: any) => {
            side.sections?.forEach((section: any) => {
              section.fields?.forEach((field: any) => {
                if (Array.isArray(field?.imgUrls)) {
                  field.imgUrls.forEach((url: string) => {
                    if (url) imageUrls.add(url);
                  });
                }
                if (field?.imgUrl) imageUrls.add(field.imgUrl);
              });
            });
          });
        }

        // delete images from Cloudinary (best-effort)
        for (const url of imageUrls) {
          const publicId = extractPublicId(url);
          if (publicId) {
            deletePromises.push(
              (async () => {
                try {
                  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
                } catch (err) {
                  console.error("Cloudinary delete failed for", publicId, err);
                }
              })()
            );
          }
        }

        // delete the form document
        deletePromises.push(deleteDoc(doc(db, "projects", id, "forms", fdoc.id)));
      }

      await Promise.all(deletePromises);
    } catch (err) {
      console.error("Failed to cascade-delete forms or images:", err);
    }

    await deleteDoc(docRef);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete project error:", err);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}

