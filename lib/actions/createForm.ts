import { db } from "@/lib/firebase";
import { doc, collection, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

export async function createForm(form: Omit<Form, "id">) {
  const formRef = doc(collection(db, "forms"));

  const newForm: Form = {
    ...form,
    id: formRef.id,
  };

  await setDoc(formRef, newForm);

  // add form id to project
  await updateDoc(doc(db, "projects", form.projectId), {
    forms: arrayUnion(newForm),
  });

  return newForm;
}
