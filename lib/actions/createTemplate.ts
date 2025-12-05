import { db } from "@/lib/firebase";
import { doc, collection, setDoc } from "firebase/firestore";

export async function createFormTemplate(template: Omit<FormTemplate, "id" | "createdAt">) {
  const ref = doc(collection(db, "formTemplates"));

  const newTemplate: FormTemplate = {
    ...template,
    id: ref.id,
    createdAt: Date.now(),
  };

  await setDoc(ref, newTemplate);

  return newTemplate;
}
