import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function deleteRoofSide(
  projectId: string,
  formId: string,
  roofSideId: string
) {
  const formRef = doc(db, "projects", projectId, "forms", formId);
  const formSnap = await getDoc(formRef);

  if (!formSnap.exists()) {
    throw new Error("Form not found");
  }

  const formData = formSnap.data() as Form;
  const roofSides = formData.roofSides || [];

  // Remove the roofSide with the matching id
  const updatedRoofSides = roofSides.filter((roofSide) => roofSide.id !== roofSideId);

  // Update the form
  await updateDoc(formRef, {
    roofSides: updatedRoofSides,
  });

  return { success: true };
}