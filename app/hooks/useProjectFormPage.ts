"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useFormHeader } from "@/app/context/FormHeaderContext";
import {
  createCustomField,
  createRoofSide,
  buildUpdatedGeneralSection,
  buildUpdatedRoofSides,
} from "@/app/helpers/formHelpers";

type UseProjectFormPageParams = {
  projectId?: string;
  formId?: string;
};

const mergeRoofSideWithSavedStructure = (serverSide: RoofSide, localSide: RoofSide): RoofSide => {
  const mergedSections = localSide.sections.map((localSection) => {
    const serverSection = serverSide.sections.find((section) => section.id === localSection.id);

    if (!serverSection) {
      return localSection;
    }

    const mergedFields = localSection.fields.map((localField) => {
      const serverField = serverSection.fields.find((field) => field.fieldId === localField.fieldId);

      if (!serverField) {
        return localField;
      }

      return {
        ...localField,
        ...serverField,
        _isCustom: localField._isCustom ?? serverField._isCustom,
      };
    });

    return {
      ...serverSection,
      ...localSection,
      fields: mergedFields,
    };
  });

  return {
    ...serverSide,
    ...localSide,
    sections: mergedSections,
  };
};

const getImageUrls = (savedField: any, field: FormField): string[] => {
  if (savedField?.imageTouched) {
    return Array.isArray(savedField?.imgUrls) ? savedField.imgUrls : [];
  }
  if (Array.isArray(savedField?.imgUrls) && savedField.imgUrls.length > 0) return savedField.imgUrls;
  if (Array.isArray(field.imgUrls) && field.imgUrls.length > 0) return field.imgUrls;
  // Legacy: migrate single imgUrl string to array on first load
  if ((field as any).imgUrl) return [(field as any).imgUrl as string];
  return [];
};

export function useProjectFormPage({ projectId, formId }: UseProjectFormPageParams) {
  const router = useRouter();
  const { user } = useUser();
  const { setHeader } = useFormHeader();

  const [form, setForm] = useState<Form | null>(null);
  const [edits, setEdits] = useState<FormEdits>({});
  const [localImages, setLocalImages] = useState<{ [fieldId: string]: File[] }>({});
  const [uploadErrors, setUploadErrors] = useState<{ [fieldId: string]: string | null }>({});
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingForm, setDeletingForm] = useState(false);
  const [customerParticipants, setCustomerParticipants] = useState("");
  const [workerParticipants, setWorkerParticipants] = useState("");
  const [companyParticipants, setCompanyParticipants] = useState("");
  const [generateError, setGenerateError] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const autoSaveTimerRef = useRef<number | null>(null);
  const lastSavedPayload = useRef<string | null>(null);
  const savingInFlightRef = useRef(false);

  const storageKey = `form-edits-${projectId}-${formId}`;
  const formStorageKey = `form-data-${projectId}-${formId}`;

  const role = user?.publicMetadata?.role;
  const canDeleteForm = Boolean(user?.id) && (role === "admin" || form?.ownerId === user?.id);

  const fetchForm = useCallback(async () => {
    if (!projectId || !formId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/public/projects/${projectId}/forms/${formId}`);
      if (!res.ok) throw new Error("Failed to load form");
      let data: Form = await res.json();

      const savedForm = localStorage.getItem(formStorageKey);
      if (savedForm) {
        try {
          const parsed: Form = JSON.parse(savedForm);
          if (parsed.roofSides) {
            const serverSides = data.roofSides || [];
            const localSides = parsed.roofSides || [];
            const localById = new Map(localSides.map((s) => [s.id, s]));

            const mergedExisting = serverSides.map((serverSide) => {
              const localSide = localById.get(serverSide.id);
              return localSide
                ? mergeRoofSideWithSavedStructure(serverSide, localSide)
                : serverSide;
            });

            const existingIds = new Set(serverSides.map((s) => s.id));
            const newLocals = localSides.filter(
              (s: RoofSide) => (s as any)._isLocal && !existingIds.has(s.id)
            );

            data = { ...data, roofSides: [...mergedExisting, ...newLocals] };
          }
        } catch (err) {
          console.warn("could not parse saved form from storage", err);
        }
      }

      setForm(data);

      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      const initialEdits: FormEdits = {};

      data.generalSection.forEach((f) => {
        const imageUrls = getImageUrls(saved[f.fieldId], f);
        initialEdits[f.fieldId] = {
          selected: saved[f.fieldId]?.selected || f.selected || "",
          comment: saved[f.fieldId]?.comment || f.comment || "",
          imgUrls: imageUrls,
          imageTouched: saved[f.fieldId]?.imageTouched === true,
        };
      });

      data.roofSides?.forEach((side) =>
        side.sections.forEach((section) =>
          section.fields.forEach((f) => {
            const imageUrls = getImageUrls(saved[f.fieldId], f);
            initialEdits[f.fieldId] = {
              selected: saved[f.fieldId]?.selected || f.selected || "",
              comment: saved[f.fieldId]?.comment || f.comment || "",
              imgUrls: imageUrls,
              imageTouched: saved[f.fieldId]?.imageTouched === true,
            };
          })
        )
      );

      setEdits(initialEdits);
      setCustomerParticipants(data.customerParticipants || "");
      setWorkerParticipants(data.workerParticipants || "");
      setCompanyParticipants(data.companyParticipants || "");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to load form");
    } finally {
      setLoading(false);
    }
  }, [projectId, formId, storageKey, formStorageKey]);

  const saveOption = useCallback((fieldId: string, option: string) => {
    setEdits((prev) => {
      const prevField = prev[fieldId] || {};
      return { ...prev, [fieldId]: { ...prevField, selected: option } };
    });
  }, []);

  const saveComment = useCallback((fieldId: string, comment: string) => {
    setEdits((prev) => {
      const prevField = prev[fieldId] || {};
      return {
        ...prev,
        [fieldId]: { ...prevField, comment },
      };
    });
  }, []);

  const saveImage = useCallback(async (fieldId: string, files: File[]) => {
    if (!files.length) return;

    console.log(`[ImageUpload] Starting upload for field: ${fieldId}, files count: ${files.length}`, {
      fileNames: files.map(f => f.name),
      fileSizes: files.map(f => f.size),
    });

    setUploadErrors((prev) => ({ ...prev, [fieldId]: null }));
    setLocalImages((prev) => ({
      ...prev,
      [fieldId]: [...(prev[fieldId] || []), ...files],
    }));

    const uploadedUrls: string[] = [];
    let failedUploads = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`[ImageUpload] Uploading file ${i + 1}/${files.length}: ${file.name}`);

        const formData = new FormData();
        formData.append("file", file);

        const startTime = Date.now();
        const res = await fetch("/api/public/upload/image", {
          method: "POST",
          body: formData,
        });
        const duration = Date.now() - startTime;

        console.log("[ImageUpload] Upload response headers", {
          status: res.status,
          statusText: res.statusText,
          contentType: res.headers.get("content-type"),
        });

        if (!res.ok) {
          failedUploads += 1;
          let errorMessage =
            res.status === 413
              ? "Bilden är för stor för att laddas upp. Prova en mindre bild."
              : res.status >= 500
              ? "Serverfel vid uppladdning. Försök igen om en stund."
              : "Bilduppladdning misslyckades";

          try {
            const data = await res.json();
            if (typeof data?.error === "string" && data.error.trim()) {
              errorMessage = data.error;
            }
          } catch {
            try {
              const text = await res.text();
              if (text.trim()) errorMessage = text;
            } catch {
              // keep default
            }
          }

          console.error(`[ImageUpload] Failed to upload ${file.name}: ${errorMessage}`, {
            fieldId,
            fileName: file.name,
            fileSize: file.size,
            statusCode: res.status,
            duration: `${duration}ms`,
          });
          continue;
        }

        const responseData = await res.json();
        console.log("[ImageUpload] Upload response body", responseData);
        const { url } = responseData;
        if (url) {
          console.log(`[ImageUpload] File ${file.name} uploaded successfully`, {
            fieldId,
            fileName: file.name,
            duration: `${duration}ms`,
            url,
          });
          uploadedUrls.push(url);
        } else {
          failedUploads += 1;
          console.error(`[ImageUpload] No URL returned for ${file.name}`, { fieldId, fileName: file.name });
        }
      }

      if (uploadedUrls.length > 0) {
        console.log(`[ImageUpload] Successfully uploaded ${uploadedUrls.length} files`, {
          fieldId,
          uploadedCount: uploadedUrls.length,
        });

        setEdits((prev) => {
          const prevField = prev[fieldId] || {};
          const nextUrls = [...(prevField.imgUrls ?? []), ...uploadedUrls];
          return {
            ...prev,
            [fieldId]: { ...prevField, imgUrls: nextUrls, imageTouched: true },
          };
        });
      }

      if (failedUploads > 0) {
        console.warn(`[ImageUpload] Upload completed with ${failedUploads} failures`, {
          fieldId,
          totalFiles: files.length,
          failedCount: failedUploads,
          successCount: uploadedUrls.length,
        });

        setUploadErrors((prev) => ({
          ...prev,
          [fieldId]:
            failedUploads === files.length
              ? "Kunde inte ladda upp bilden. Kontrollera uppkopplingen och försök igen."
              : `Kunde inte ladda upp ${failedUploads} av ${files.length} bilder. Kontrollera uppkopplingen och försök igen.`,
        }));
      } else {
        console.log(`[ImageUpload] All files uploaded successfully for field: ${fieldId}`);
        setUploadErrors((prev) => ({ ...prev, [fieldId]: null }));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isNetworkError = error instanceof TypeError && (errorMsg.includes("fetch") || errorMsg.includes("network") || errorMsg.includes("Failed"));
      console.error(`[ImageUpload] Unexpected error during upload`, {
        fieldId,
        error: errorMsg,
        fileCount: files.length,
      });
      setUploadErrors((prev) => ({
        ...prev,
        [fieldId]: isNetworkError
          ? "Ingen anslutning till servern. Kontrollera uppkopplingen och försök igen."
          : files.length === 1
          ? "Kunde inte ladda upp bilden. Försök igen."
          : `Kunde inte ladda upp ${files.length} bilder. Försök igen.`,
      }));
    } finally {
      setLocalImages((prev) => ({
        ...prev,
        [fieldId]: [],
      }));
    }
  }, []);

  const deleteImage = useCallback(async (fieldId: string, imageUrl: string) => {
    console.log(`[ImageDelete] Deleting image from field: ${fieldId}`);

    if (imageUrl) {
      try {
        const res = await fetch("/api/public/upload/image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: imageUrl }),
        });

        if (!res.ok) {
          console.error(`[ImageDelete] Failed to delete image from server`, {
            fieldId,
            statusCode: res.status,
            url: imageUrl,
          });
          return;
        }

        console.log(`[ImageDelete] Image deleted successfully from server`, { fieldId });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[ImageDelete] Error deleting image`, {
          fieldId,
          error: errorMsg,
        });
        return;
      }
    }

    setEdits((prev) => {
      const prevField = prev[fieldId] || {};
      const nextUrls = (prevField.imgUrls ?? []).filter((url) => url !== imageUrl);
      return {
        ...prev,
        [fieldId]: { ...prevField, imgUrls: nextUrls, imageTouched: true },
      };
    });

    setLocalImages((prev) => {
      if (!(fieldId in prev)) return prev;
      const next = { ...prev };
      next[fieldId] = [];
      return next;
    });
  }, []);

  const addRoofSideHandler = useCallback((name?: string) => {
    if (!form) return;

    const newSide = createRoofSide(name, form.roofSides?.length);
    setForm({ ...form, roofSides: [...(form.roofSides || []), newSide] });

    const newEdits: FormEdits = {};
    newSide.sections.forEach((section) =>
      section.fields.forEach((f) => {
        newEdits[f.fieldId] = {
          selected: "",
          comment: "",
          imgUrls: [],
          imageTouched: false,
        };
      })
    );
    setEdits((prev) => ({ ...prev, ...newEdits }));
  }, [form]);

  const handleAddCustomField = useCallback((roofSideId: string, sectionId: string, title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const newField = createCustomField(trimmedTitle);

    setForm((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        roofSides: (prev.roofSides || []).map((side) => {
          if (side.id !== roofSideId) return side;

          return {
            ...side,
            sections: side.sections.map((section) => {
              if (section.id !== sectionId) return section;
              return {
                ...section,
                fields: [...section.fields, newField],
              };
            }),
          };
        }),
      };
    });

    setEdits((prev) => ({
      ...prev,
      [newField.fieldId]: {
        selected: "",
        comment: "",
        imgUrls: [],
        imageTouched: false,
      },
    }));
  }, []);

  const handleRemoveCustomField = useCallback((roofSideId: string, sectionId: string, fieldId: string) => {
    setForm((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        roofSides: (prev.roofSides || []).map((side) => {
          if (side.id !== roofSideId) return side;

          return {
            ...side,
            sections: side.sections.map((section) => {
              if (section.id !== sectionId) return section;
              return {
                ...section,
                fields: section.fields.filter((field) => field.fieldId !== fieldId),
              };
            }),
          };
        }),
      };
    });

    setEdits((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });

    setLocalImages((prev) => {
      if (!(fieldId in prev)) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  const doSave = useCallback(async (): Promise<Form | null> => {
    if (!form || !projectId || !formId) return null;

    const updatedGeneral = buildUpdatedGeneralSection(form.generalSection, edits, localImages);
    const updatedRoofSides = buildUpdatedRoofSides(form.roofSides, edits, localImages);

    const payload = {
      ...form,
      generalSection: updatedGeneral,
      roofSides: updatedRoofSides || [],
      customerParticipants: customerParticipants.trim() || undefined,
      workerParticipants: workerParticipants.trim() || undefined,
      companyParticipants: companyParticipants.trim() || undefined,
    };

    const str = JSON.stringify(payload);
    if (lastSavedPayload.current === str) {
      return null;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    const res = await fetch(`/api/public/projects/${projectId}/forms/${formId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: str,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Server returned ${res.status}: ${body}`);
    }

    const saved: Form = await res.json();
    lastSavedPayload.current = str;

    localStorage.removeItem(storageKey);
    localStorage.removeItem(formStorageKey);
    setLocalImages({});

    setForm(saved);
    return saved;
  }, [
    form,
    edits,
    localImages,
    projectId,
    formId,
    storageKey,
    formStorageKey,
    customerParticipants,
    workerParticipants,
    companyParticipants,
  ]);

  const handleSave = useCallback(async (e?: FormEvent) => {
    e?.preventDefault();
    setHeader?.({ saving: true });
    try {
      await doSave();
    } catch (err: any) {
      console.error("Save failed:", err);
      alert(err.message || "Failed to save form");
    } finally {
      setHeader?.({ saving: false });
    }
  }, [doSave, setHeader]);

  const handlePdfGenerate = useCallback(async () => {
    if (!projectId || !formId) return;

    await handleSave();
    setHeader?.({ generating: true });
    setGenerateError(null);

    try {
      const res = await fetch(`/api/public/projects/${projectId}/forms/${formId}/pdf`, {
        method: "GET",
      });

      if (!res.ok) {
        setGenerateError("Failed to fetch form");
        throw new Error("Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `form-${formId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setGenerateError(err.message || "Failed to generate PDF");
    } finally {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setHeader?.({ generating: false, saving: false });
    }
  }, [formId, handleSave, projectId, setHeader]);

  const handleDeleteForm = useCallback(async () => {
    if (!projectId || !formId || !canDeleteForm) return;

    setDeletingForm(true);

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    try {
      const res = await fetch(`/api/public/projects/${projectId}/forms/${formId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Server returned ${res.status}: ${body}`);
      }

      localStorage.removeItem(storageKey);
      localStorage.removeItem(formStorageKey);
      router.push(`/projects/${projectId}`);
    } catch (err: any) {
      console.error("Delete form failed:", err);
      alert(err.message || "Failed to delete form");
      setDeletingForm(false);
    }
  }, [projectId, formId, canDeleteForm, storageKey, formStorageKey, router]);

  const onRoofSideDeleted = useCallback((id: string) => {
    const stored = localStorage.getItem(formStorageKey);
    if (stored) {
      try {
        const parsed: Form = JSON.parse(stored);
        parsed.roofSides = parsed.roofSides?.filter((s) => s.id !== id);
        localStorage.setItem(formStorageKey, JSON.stringify(parsed));
      } catch {
        // ignore corrupt local storage payload
      }
    }
    fetchForm();
  }, [fetchForm, formStorageKey]);

  useEffect(() => {
    if (!projectId || !formId) return;
    fetchForm();
  }, [projectId, formId, fetchForm]);

  useEffect(() => {
    if (!loading) localStorage.setItem(storageKey, JSON.stringify(edits));
  }, [edits, loading, storageKey]);

  useEffect(() => {
    if (!loading && form) {
      localStorage.setItem(formStorageKey, JSON.stringify(form));
    }
  }, [form, loading, formStorageKey]);

  useEffect(() => {
    setHeader?.({
      showSave: true,
      onSave: handleSave,
      showGenerate: true,
      onGeneratePdf: handlePdfGenerate,
    });

    return () => {
      setHeader?.({
        showSave: false,
        showGenerate: false,
        onSave: undefined,
        onGeneratePdf: undefined,
      });
    };
  }, [setHeader, handleSave, handlePdfGenerate]);

  useEffect(() => {
    if (!form || loading || deletingForm) return;
    if (savingInFlightRef.current) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = window.setTimeout(async () => {
      savingInFlightRef.current = true;
      try {
        await doSave();
      } catch (err) {
        console.error("autosave failed", err);
      } finally {
        savingInFlightRef.current = false;
      }
    }, 180000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [
    edits,
    form,
    localImages,
    loading,
    doSave,
    customerParticipants,
    workerParticipants,
    companyParticipants,
    deletingForm,
  ]);

  useEffect(() => {
    lastSavedPayload.current = null;
  }, [form]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, []);

  return {
    form,
    edits,
    localImages,
    uploadErrors,
    loading,
    showDeleteModal,
    deletingForm,
    customerParticipants,
    workerParticipants,
    companyParticipants,
    canDeleteForm,
    saveOption,
    saveComment,
    saveImage,
    deleteImage,
    addRoofSideHandler,
    handleAddCustomField,
    handleRemoveCustomField,
    handleDeleteForm,
    onRoofSideDeleted,
    setShowDeleteModal,
    setCustomerParticipants,
    setWorkerParticipants,
    setCompanyParticipants,
  };
}
