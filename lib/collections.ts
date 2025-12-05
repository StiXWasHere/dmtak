import { collection } from "firebase/firestore";
import { db } from "./firebase";

// root collections
export const usersCol = collection(db, "users");
export const projectsCol = collection(db, "projects");
export const formTemplatesCol = collection(db, "formTemplates");

// subcollections
export const projectFormsCol = (projectId: string) =>
  collection(db, `projects/${projectId}/forms`);

export const formGeneralFieldsCol = (projectId: string, formId: string) =>
  collection(db, `projects/${projectId}/forms/${formId}/generalFields`);

export const formRoofSidesCol = (projectId: string, formId: string) =>
  collection(db, `projects/${projectId}/forms/${formId}/roofSides`);

export const roofSideSectionsCol = (
  projectId: string,
  formId: string,
  sideId: string
) => collection(db, `projects/${projectId}/forms/${formId}/roofSides/${sideId}/sections`);

export const sectionFieldsCol = (
  projectId: string,
  formId: string,
  sideId: string,
  sectionId: string
) =>
  collection(
    db,
    `projects/${projectId}/forms/${formId}/roofSides/${sideId}/sections/${sectionId}/fields`
  );
