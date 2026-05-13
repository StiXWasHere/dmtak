import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import { deleteImage } from "@/lib/actions/deleteImage";
import { logger } from "@/lib/logger";

//Upload to Cloudinary setup

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      logger.warn("ImageUpload", "No file provided in upload request");
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    logger.info("ImageUpload", "File upload started", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // Convert to buffer and upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const startOptimize = Date.now();
    const optimizedBuffer = await sharp(buffer)
      .rotate()
      .resize({
        width: 1200,
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 75,
        mozjpeg: true,
      })
      .toBuffer();

    logger.info("ImageUpload", "Image optimized", {
      originalSize: buffer.length,
      optimizedSize: optimizedBuffer.length,
      duration: `${Date.now() - startOptimize}ms`,
    });

    //Upload buffered image to Cloudinary
    const startUpload = Date.now();
    const result = await new Promise<any>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: "forms",
          eager: [
            { width: 800, quality: 75, fetch_format: "jpg" },
          ],
          eager_async: false,
         },
        (err, res) => {
          if (err) reject(err);
          else resolve(res);
        }
      );
      upload.end(optimizedBuffer);
    });

    logger.info("ImageUpload", "File uploaded to Cloudinary successfully", {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      duration: `${Date.now() - startUpload}ms`,
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("ImageUpload", "Upload failed", error, {
      errorName: error.name,
    });
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url as string | undefined;

    if (!url) {
      logger.warn("ImageDelete", "No image URL provided for deletion");
      return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
    }

    logger.info("ImageDelete", "Attempting to delete image", { url });

    const result = await deleteImage(url);

    logger.info("ImageDelete", "Image deleted successfully", {
      publicId: result.publicId,
      deleteResult: result.result,
    });

    return NextResponse.json(result);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("ImageDelete", "Delete failed", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
