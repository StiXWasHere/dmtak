// helpers/formHelpers.ts
import { v4 as uuid } from "uuid";
import { roofSideTemplate } from "../data/roofSideTemplate";

type FormFieldWithLocalImage = FormField & { _hasLocalImage?: boolean };

const defaultFieldOptions = [
  "Godkänt",
  "Ej godkänt",
  "Ej aktuellt",
  "Avhjälpt",
  "Ej utförd"
] as const; // Define as const to get literal types

// Create a new roof side with unique IDs
export const createRoofSide = (name?: string, existingCount?: number): RoofSide => ({
  ...roofSideTemplate,
  id: uuid(),
  name: name || `Tak ${existingCount ? existingCount + 1 : 1}`,
  sections: roofSideTemplate.sections.map((sec) => ({
    ...sec,
    id: uuid(),
    fields: sec.fields.map((f) => ({ 
      ...f, 
      fieldId: uuid(),
      options: f.options ?? [...defaultFieldOptions]
    })),
  })),
});

// Merge a field with current edits and local image reference
export function mergeFieldForSave(
  field: FormField,
  editsForField: { selected?: string; comment?: string; imgUrl?: string } | undefined,
  localImagesMap: { [fieldId: string]: File | null }
): FormFieldWithLocalImage {
  const merged: FormFieldWithLocalImage = { ...field };
  merged.selected = editsForField?.selected ?? field.selected ?? "";
  merged.comment = editsForField?.comment ?? field.comment ?? "";
  merged.imgUrl = editsForField?.imgUrl ?? field.imgUrl ?? "";
  merged._hasLocalImage = !!localImagesMap[field.fieldId];
  return merged;
}

// Build updated general section
export function buildUpdatedGeneralSection(
  originalFields: FormField[],
  editsMap: FormEdits,
  localImagesMap: { [fieldId: string]: File | null }
): FormField[] {
  console.log("buildUpdatedGeneralSection images:" + localImagesMap)
  return originalFields.map((f) => mergeFieldForSave(f, editsMap[f.fieldId], localImagesMap));
}

// Build updated roof sides
export function buildUpdatedRoofSides(
  roofSides: RoofSide[] | undefined,
  editsMap: FormEdits,
  localImagesMap: { [fieldId: string]: File | null }
): RoofSide[] | undefined {
  if (!roofSides) return undefined;

  return roofSides.map((side) => ({
    ...side,
    sections: side.sections.map((section) => ({
      ...section,
      fields: section.fields.map((f) => mergeFieldForSave(f, editsMap[f.fieldId], localImagesMap)),
    })),
  }));
}

// Optional helper: convert a File to base64 (used only if needed before Cloudinary upload)
export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
