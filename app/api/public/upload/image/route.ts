import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import { deleteImage } from "@/lib/actions/deleteImage";

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
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    // Convert to buffer and upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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

    //Upload buffered image to Cloudinary
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
    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url as string | undefined;

    if (!url) {
      return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
    }

    const result = await deleteImage(url);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
