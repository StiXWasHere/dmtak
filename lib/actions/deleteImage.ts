import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

function extractPublicId(url: string): string | null {
  try {
    const match = url.match(
      /\/upload(?:\/[^\/]*)*\/v\d+\/(.+?)\.(?:jpg|jpeg|png|webp|gif|svg|bmp|tiff)(?:$|\?)/i
    );
    if (match?.[1]) return match[1];

    const fallbackMatch = url.match(
      /forms\/(.+?)\.(?:jpg|jpeg|png|webp|gif|svg|bmp|tiff)/i
    );
    return fallbackMatch ? `forms/${fallbackMatch[1]}` : null;
  } catch {
    return null;
  }
}

export async function deleteImage(imageUrl: string) {
  const publicId = extractPublicId(imageUrl);
  if (!publicId) {
    throw new Error("Invalid image URL");
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });

  return {
    success: result.result === "ok" || result.result === "not found",
    publicId,
    result: result.result,
  };
}
