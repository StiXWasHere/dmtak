import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

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

function collectRoofSideImageUrls(roofSide: RoofSide) {
  const imageUrls: string[] = [];

  roofSide.sections?.forEach((section) => {
    section.fields?.forEach((field) => {
      if (field.imgUrl) imageUrls.push(field.imgUrl);
    });
  });

  return imageUrls;
}

export async function deleteRoofSide(
  projectId: string,
  formId: string,
  roofSideId: string
) {
  const formRef = doc(db, "projects", projectId, "forms", formId);
  const formSnap = await getDoc(formRef);

  if (!formSnap.exists()) {
    throw new Error("Form not found");
  }

  const formData = formSnap.data() as Form;
  const roofSides = formData.roofSides || [];
  const roofSideToDelete = roofSides.find((roofSide) => roofSide.id === roofSideId);

  if (roofSideToDelete) {
    const imageUrls = collectRoofSideImageUrls(roofSideToDelete);

    await Promise.all(
      imageUrls.map(async (url) => {
        const publicId = extractPublicId(url);
        if (!publicId) return;

        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        } catch (cloudinaryError) {
          console.error("Cloudinary delete failed for", publicId, cloudinaryError);
        }
      })
    );
  }

  // Remove the roofSide with the matching id
  const updatedRoofSides = roofSides.filter((roofSide) => roofSide.id !== roofSideId);

  // Update the form
  await updateDoc(formRef, {
    roofSides: updatedRoofSides,
  });

  return { success: true };
}