import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; formId: string }> }
) {
  const { id, formId } = await context.params;

  const { userId } = getAuth(req);
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const baseUrl = process.env.APP_URL;
  if (!baseUrl) {
    return new Response("APP_URL not configured", { status: 500 });
  }

  const logoPath = path.join(process.cwd(), "public", "dmtaklogo.png");
  const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
  const logoDataUrl = `data:image/png;base64,${logoBase64}`;

  const logoUrl = `${baseUrl}/dmtaklogo.png`;

  console.log(logoUrl)

  const pdfPageUrl = `${baseUrl}/pdf/${id}/${formId}`;

  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Forward auth cookies to Playwright
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map(c => {
        const [name, ...rest] = c.trim().split("=");
        return {
          name,
          value: rest.join("="),
          domain: new URL(baseUrl).hostname,
          path: "/",
        };
      });

      await page.context().addCookies(cookies);
    }

    await page.goto(pdfPageUrl, {
      waitUntil: "networkidle",
    });

    await page.emulateMedia({ media: "print" });

    await page.evaluate(async () => {
      const imgs = Array.from(document.images);
      await Promise.all(imgs.map(img => {
        if (img.complete) return;
        return new Promise(resolve => {
          img.onload = img.onerror = resolve;
        });
      }));
    });


    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      scale: 1,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="
        width:100%; 
        display:flex;
        align-items:center;
        justify-content:center;
        border-bottom:1px solid rgba(0, 0, 0, 1);
        ">
          <img
            src="${logoDataUrl}"
            style="height:59px;"
            alt="DM TAK Logo"
          />
        </div>
      `,
      footerTemplate: `
        <div style="width:100%; text-align:center; font-size:10px;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
    });

    return new NextResponse(Uint8Array.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="form-${formId}.pdf"`,
      },
    });
  } finally {
    await browser.close();
  }
}
