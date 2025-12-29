import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";
import fs from "fs";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(`
      <html>
        <body style="background: #f0f0f0; height: 1000px;">
          <h1 style="margin:0; padding:0;">Hello World</h1>
        </body>
      </html>
    `);

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: "100px",   // noticeable top margin
        bottom: "50px",
        left: "20mm",
        right: "20mm",
      },
    });

    return new NextResponse(Uint8Array.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="test.pdf"`,
      },
    });
  } finally {
    await browser.close();
  }
}
