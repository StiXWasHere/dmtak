import { v2 as cloudinary } from "cloudinary";
import { logger } from "@/lib/logger";

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
  } catch (err) {
    logger.error("extractPublicId", "Failed to extract public ID from URL", err instanceof Error ? err : new Error(String(err)), { url });
    return null;
  }
}

export async function deleteImage(imageUrl: string) {
  try {
    logger.info("deleteImage", "Extracting public ID from URL", { url: imageUrl });

    const publicId = extractPublicId(imageUrl);
    if (!publicId) {
      logger.warn("deleteImage", "Failed to extract public ID from URL", { url: imageUrl });
      throw new Error("Invalid image URL");
    }

    logger.info("deleteImage", "Calling Cloudinary destroy API", { publicId });

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    logger.info("deleteImage", "Cloudinary destroy completed", {
      publicId,
      result: result.result,
    });

    return {
      success: result.result === "ok" || result.result === "not found",
      publicId,
      result: result.result,
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("deleteImage", "Delete operation failed", error, { url: imageUrl });
    throw error;
  }
}
