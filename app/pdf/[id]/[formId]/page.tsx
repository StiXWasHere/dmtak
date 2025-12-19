// app/pdf/[id]/[formId]/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import FormPdf from "@/app/pdf/FormPdf";
import { getFormOrThrow } from "@/app/helpers/getForm";

type Props = {
  params: Promise<{
    id: string;
    formId: string;
  }>;
};

export default async function PdfPage({ params }: Props) {
    const { id , formId } = await params;
    const user = await currentUser();
    if (!user) {
        throw new Error("Unauthorized");
    }

    const role = user.publicMetadata.role;

    if (role !== "admin" && role !== "project") {
        throw new Error("Forbidden");
    };

    const form = await getFormOrThrow(id, formId);

    return <FormPdf form={form} />;
}
