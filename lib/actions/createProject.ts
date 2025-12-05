import { db } from "@/lib/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function createProject(title: string) {
  const projectRef = doc(collection(db, "projects"));

  const project: Project = {
    id: projectRef.id,
    title,
    createdAt: Date.now(),
    forms: [],
  };

  await setDoc(projectRef, project);

  return project;
}
