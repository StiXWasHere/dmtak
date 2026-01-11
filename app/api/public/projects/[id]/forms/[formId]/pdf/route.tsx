import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { renderToBuffer } from "@react-pdf/renderer";
import FormPdf from "@/app/pdf/FormPdf";
import { getFormOrThrow } from "@/app/helpers/getForm";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string; formId: string }> }
) {
  const paramsResolved = await context.params; // <-- unwrap here
  const { id, formId } = paramsResolved;

  if (!id || !formId) {
    return new NextResponse("Missing project ID or form ID", { status: 400 });
  }

  const user = await currentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const role = user.publicMetadata.role;
  if (role !== "admin" && role !== "project")
    return new NextResponse("Forbidden", { status: 403 });

  const form = await getFormOrThrow(id, formId);

  const pdfBuffer = await renderToBuffer(<FormPdf form={form} />);

  return new NextResponse(Uint8Array.from(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="form-${formId}.pdf"`,
    },
  });
}

