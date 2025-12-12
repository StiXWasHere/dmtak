// hooks/useFormEdits.ts
import { useEffect, useState } from "react";

export const useFormEdits = (projectId: string, formId: string) => {
  const [form, setForm] = useState<Form | null>(null);
  const [edits, setEdits] = useState<FormEdits>({});
  const [localImages, setLocalImages] = useState<{ [fieldId: string]: File | null }>({});
  const [loading, setLoading] = useState(true);

  const storageKey = `form-edits-${projectId}-${formId}`;

  useEffect(() => {
    if (!projectId || !formId) return;
    const fetchForm = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/public/projects/${projectId}/forms/${formId}`);
        if (!res.ok) throw new Error("Failed to load form");
        const data: Form = await res.json();
        setForm(data);

        const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
        const initialEdits: FormEdits = {};

        // initialize general fields
        data.generalSection.forEach(f => {
          initialEdits[f.fieldId] = {
            selected: f.selected || saved[f.fieldId]?.selected || "",
            comment: f.comment || saved[f.fieldId]?.comment || "",
            imgUrl: f.imgUrl || saved[f.fieldId]?.imgUrl || ""
          };
        });

        // initialize roof sides
        data.roofSides?.forEach(side =>
          side.sections.forEach(section =>
            section.fields.forEach(f => {
              initialEdits[f.fieldId] = {
                selected: f.selected || saved[f.fieldId]?.selected || "",
                comment: f.comment || saved[f.fieldId]?.comment || "",
                imgUrl: f.imgUrl || saved[f.fieldId]?.imgUrl || ""
              };
            })
          )
        );

        setEdits(initialEdits);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [projectId, formId]);

  // Autosave
  useEffect(() => {
    if (!loading) localStorage.setItem(storageKey, JSON.stringify(edits));
  }, [edits, loading]);

  const saveOption = (fieldId: string, option: string) =>
    setEdits(prev => ({ ...prev, [fieldId]: { ...prev[fieldId], selected: option } }));

  const saveComment = (fieldId: string, comment: string) =>
    setEdits(prev => ({ ...prev, [fieldId]: { ...prev[fieldId], comment } }));

  const saveImage = (fieldId: string, file: File) => {
    setLocalImages(prev => ({ ...prev, [fieldId]: file }));
    setEdits(prev => ({ ...prev, [fieldId]: { ...prev[fieldId], imgUrl: "" } }));
  };

  return {
    form,
    setForm,
    edits,
    setEdits,
    localImages,
    setLocalImages,
    loading,
    saveOption,
    saveComment,
    saveImage,
  };
};
