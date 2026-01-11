import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { chromium as pwChromium, type Browser } from "playwright-core";
import chromeLambda from "@sparticuz/chromium";
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

  const pdfPageUrl = `${baseUrl}/pdf/${id}/${formId}`;

  let browser: Browser | undefined;

  // Determine executable path and args — fall back to Playwright's default on Windows/local dev
  let executablePath: string | undefined;
  let launchArgs: string[] = [];
  try {
    const candidate = await chromeLambda.executablePath();
    if (candidate && fs.existsSync(candidate)) {
      executablePath = candidate;
      launchArgs = (chromeLambda.args || []).concat(["--no-sandbox", "--disable-setuid-sandbox"]);
    } else {
      console.warn("@sparticuz/chromium executable not found; falling back to bundled browser");
    }
  } catch (e) {
    console.warn("chromeLambda.executablePath() failed, falling back to Playwright default:", e);
  }

  try {
    const launchOptions: any = { headless: true, timeout: 15000 };
    if (executablePath) launchOptions.executablePath = executablePath;
    // Use args only when we got them from chromeLambda; on Windows local dev it's safer to omit
    if (launchArgs.length) launchOptions.args = launchArgs;

    try {
      browser = await pwChromium.launch(launchOptions);
    } catch (launchErr) {
      console.error("Browser launch failed with options:", launchOptions, launchErr);
      // If we attempted a custom executablePath/args, retry with Playwright defaults
      if (launchOptions.executablePath || launchOptions.args) {
        try {
          console.warn("Retrying browser launch without custom executablePath/args...");
          const fallbackOptions: any = { headless: true, timeout: 15000 };
          browser = await pwChromium.launch(fallbackOptions);
        } catch (fallbackErr) {
          console.error("Fallback browser launch failed:", fallbackErr);
          const msg = "Failed to launch browser. Ensure Playwright browsers are installed: run `npx playwright install --with-deps`";
          return new NextResponse(msg, { status: 500 });
        }
      } else {
        const msg = "Failed to launch browser. Ensure Playwright browsers are installed: run `npx playwright install --with-deps`";
        return new NextResponse(msg, { status: 500 });
      }
    }

    const page = await browser.newPage();

    // Forward auth cookies to Playwright. Use `url` instead of `domain` so
    // cookies attach correctly regardless of environment (localhost vs prod).
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map((c) => {
        const [name, ...rest] = c.trim().split("=");
        return {
          name,
          value: rest.join("="),
          url: baseUrl,
        } as any;
      });

      try {
        await page.context().addCookies(cookies as any);
      } catch (e) {
        console.warn("addCookies failed:", e);
      }
    }

    await page.goto(pdfPageUrl, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});

    // Ensure print media so headers/footers render correctly
    try {
      // emulateMedia accepts an object; keep compatibility
      // ts-expect-error - runtime API
      await (page as any).emulateMedia({ media: "print" });
    } catch (e) {
      // if emulateMedia not available, ignore
    }

    await page.evaluate(async () => {
      const imgs = Array.from(document.images);
      await Promise.all(
        imgs.map((img) => {
          if ((img as HTMLImageElement).complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = img.onerror = resolve;
          });
        })
      );
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      scale: 1,
      displayHeaderFooter: true,
      margin: { top: "40mm", right: "20mm", bottom: "20mm", left: "20mm" },
      headerTemplate: `
        <div style="width:100%; display:flex; align-items:center; justify-content:center;">
          <img src="${logoDataUrl}" style="height:59px;" alt="DM TAK Logo" />
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
        "Content-Length": String((pdfBuffer as any).length ?? 0),
      },
    });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.warn("browser.close() failed:", e);
      }
    }
  }
}
