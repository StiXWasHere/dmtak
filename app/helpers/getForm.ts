// lib/forms/getForm.ts
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getFormOrThrow(id: string, formId: string): Promise<Form> {
  if (!id || !formId) {
    throw new Error("Missing project ID or form ID");
  }

  const formRef = doc(db, "projects", id, "forms", formId);
  const snap = await getDoc(formRef);

  if (!snap.exists()) {
    throw new Error("Form not found");
  }

  return snap.data() as Form;
}
