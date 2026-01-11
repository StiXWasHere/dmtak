import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { chromium as pwChromium, type Browser } from "playwright-core";
import chromium from "@sparticuz/chromium";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; formId: string }> }
) {
  const { id, formId } = await context.params;

  const isServerless = Boolean(process.env.VERCEL);

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

  const pdfPageUrl = `${baseUrl}/pdf/${id}/${formId}`;

  let browser: Browser | undefined;

    try {
    const launchOptions: any = {
      headless: true,
      timeout: 15000,
    };

    if (isServerless) {
      launchOptions.executablePath = await chromium.executablePath();
      launchOptions.args = chromium.args;
    }

    browser = await pwChromium.launch(launchOptions);

    const page = await browser.newPage();

    // forward cookies so Clerk auth works
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      await page.context().addCookies(
        cookieHeader.split(";").map((c) => {
          const [name, ...rest] = c.trim().split("=");
          return {
            name,
            value: rest.join("="),
            url: baseUrl,
          };
        })
      );
    }

    await page.goto(pdfPageUrl, {
      waitUntil: "networkidle",
      timeout: 15000,
    });

    await page.emulateMedia({ media: "print" });

    // wait for images
    await page.evaluate(async () => {
      await Promise.all(
        Array.from(document.images).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((res) => {
                img.onload = img.onerror = res;
              })
        )
      );
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      margin: {
        top: "40mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
      headerTemplate: `
        <div style="width:100%;display:flex;justify-content:center;">
          <img src="${logoDataUrl}" style="height:59px;" />
        </div>
      `,
      footerTemplate: `
        <div style="width:100%;text-align:center;font-size:10px;">
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
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}