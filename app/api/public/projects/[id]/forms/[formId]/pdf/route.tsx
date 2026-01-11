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
    console.log("PDF route start", { id, formId, isServerless, pdfPageUrl });

    const launchOptions: any = {
      headless: true,
      timeout: 15000,
    };

    if (isServerless) {
      try {
        const execPath = await chromium.executablePath();
        if (execPath) {
          launchOptions.executablePath = execPath;
          launchOptions.args = chromium.args;
          console.log("Using @sparticuz/chromium executable and args");
        } else {
          console.warn("chromium.executablePath returned empty, will launch Playwright default");
        }
      } catch (e) {
        console.warn("chromium.executablePath() failed, falling back to Playwright default", e);
      }
    }

    try {
      browser = await pwChromium.launch(launchOptions);
      console.log("Browser launched", { hasExecutable: Boolean(launchOptions.executablePath) });
    } catch (launchErr) {
      console.error("Initial browser launch failed", launchErr);
      // fallback: try launching without custom executablePath/args
      try {
        browser = await pwChromium.launch({ headless: true, timeout: 15000 });
        console.warn("Fallback browser launch succeeded (no custom executable)");
      } catch (fallbackErr) {
        console.error("Fallback browser launch failed", fallbackErr);
        return new NextResponse(
          "Failed to launch browser. Ensure Playwright browsers are installed (npx playwright install --with-deps)",
          { status: 500 }
        );
      }
    }

    let page: any;
    try {
      page = await browser.newPage();
      console.log("Created new page");
    } catch (e) {
      console.error("page.newPage() failed", e);
      await browser.close().catch(() => {});
      return new NextResponse("Failed to create browser page", { status: 500 });
    }

    // forward cookies so Clerk auth works
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      try {
        await page.context().addCookies(
          cookieHeader.split(";").map((c) => {
            const [name, ...rest] = c.trim().split("=");
            return {
              name,
              value: rest.join("="),
              url: baseUrl,
            } as any;
          })
        );
        console.log("Added cookies to page context");
      } catch (e) {
        console.warn("addCookies failed, continuing without cookies:", e);
      }
    }

    try {
      await page.goto(pdfPageUrl, {
        waitUntil: "networkidle",
        timeout: 15000,
      });
      console.log("Page navigated to pdf page url");
    } catch (e) {
      console.error("page.goto failed", e);
      await page.close().catch(() => {});
      await browser.close().catch(() => {});
      return new NextResponse("Failed to load PDF page", { status: 500 });
    }

    try {
      // emulateMedia sometimes not available on some Playwright builds
      // ts-expect-error - runtime API
      await (page as any).emulateMedia({ media: "print" });
      console.log("Emulated print media");
    } catch (e) {
      console.warn("emulateMedia not available or failed, continuing:", e);
    }

    // wait for images
    try {
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
      console.log("Images loaded or timed out");
    } catch (e) {
      console.warn("image load wait failed, continuing:", e);
    }

    let pdfBuffer: any;
    try {
      pdfBuffer = await page.pdf({
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
      console.log("PDF generated, size:", (pdfBuffer as any).length ?? "unknown");
    } catch (e) {
      console.error("page.pdf() failed", e);
      await page.close().catch(() => {});
      await browser.close().catch(() => {});
      return new NextResponse("Failed to generate PDF", { status: 500 });
    }

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