import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// configure with env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  filePath: string,
  publicId?: string
): Promise<UploadApiResponse> {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
    });
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

export function getOptimizedUrl(publicId: string) {
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto",
  });
}

export function getCroppedUrl(publicId: string, width = 500, height = 500) {
  return cloudinary.url(publicId, {
    crop: "auto",
    gravity: "auto",
    width,
    height,
  });
}
