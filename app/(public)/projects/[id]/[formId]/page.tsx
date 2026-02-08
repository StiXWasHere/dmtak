"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { FieldItem } from "@/app/components/FieldItem/FieldItem";
import { RoofSideSection } from "@/app/components/RoofSideSection/RoofSideSection";
import {
  createRoofSide,
  buildUpdatedGeneralSection,
  buildUpdatedRoofSides,
} from "@/app/helpers/formHelpers";
import "./formPage.css";
import LoadingBar from "@/app/components/LoadingBar/LoadingBar";
import Spinner from "@/app/components/LoadingSpinner/LoadingSpinner";
import { useFormHeader } from "@/app/context/FormHeaderContext";

export default function FormPage() {
  const { id: projectId, formId } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [edits, setEdits] = useState<FormEdits>({});
  const [localImages, setLocalImages] = useState<{ [fieldId: string]: File | null }>({});
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const { setHeader } = useFormHeader();

  const timerRef = useRef<number | null>(null);
  const storageKey = `form-edits-${projectId}-${formId}`;

  // --- Load form and initialize edits ---
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

        // Initialize edits from DB + localStorage
        const initialEdits: FormEdits = {};
        data.generalSection.forEach((f) => {
          initialEdits[f.fieldId] = {
            selected: f.selected || saved[f.fieldId]?.selected || "",
            comment: f.comment || saved[f.fieldId]?.comment || "",
            imgUrl: f.imgUrl || saved[f.fieldId]?.imgUrl || "",
          };
        });
        data.roofSides?.forEach((side) =>
          side.sections.forEach((section) =>
            section.fields.forEach((f) => {
              initialEdits[f.fieldId] = {
                selected: f.selected || saved[f.fieldId]?.selected || "",
                comment: f.comment || saved[f.fieldId]?.comment || "",
                imgUrl: f.imgUrl || saved[f.fieldId]?.imgUrl || "",
              };
            })
          )
        );
        setEdits(initialEdits);
      } catch (err: any) {
        console.error(err);
        alert(err.message || "Failed to load form");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [projectId, formId]);

  // --- Autosave edits to localStorage ---
  useEffect(() => {
    if (!loading) localStorage.setItem(storageKey, JSON.stringify(edits));
  }, [edits, loading]);

  // --- Handlers ---
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
        [fieldId]: { ...prevField, comment }
      };
    });
  }, []);


  const saveImage = useCallback(async (fieldId: string, file: File) => {
    // local preview still works
    setLocalImages((prev) => ({ ...prev, [fieldId]: file }));

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/public/upload/image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.error("Image upload failed");
      return;
    }

    const { url } = await res.json();

    // store ONLY the URL in edits
    setEdits((prev) => {
      const prevField = prev[fieldId] || {};
      return {
        ...prev,
        [fieldId]: { ...prevField, imgUrl: url },
      };
    });
  }, []);


  const addRoofSideHandler = (name?: string) => {
    if (!form) return;
    const newSide = createRoofSide(name, form.roofSides?.length);
    setForm({ ...form, roofSides: [...(form.roofSides || []), newSide] });

    const newEdits: FormEdits = {};
    newSide.sections.forEach((section) =>
      section.fields.forEach((f) => {
        newEdits[f.fieldId] = { selected: "", comment: "", imgUrl: "" };
      })
    );
    setEdits((prev) => ({ ...prev, ...newEdits }));
  };

  const handleSave = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    setHeader?.({ saving: true });
    if (!form) return;

    // 1. Merge all fields with edits + mark which ones have new images
    const updatedGeneral = buildUpdatedGeneralSection(
      form.generalSection,
      edits,
      localImages
    );

    const updatedRoofSides = buildUpdatedRoofSides(
      form.roofSides,
      edits,
      localImages
    );

    // 2. Build the JSON object (same as before)
    const payload = {
      ...form,
      generalSection: updatedGeneral,
      roofSides: updatedRoofSides || [],
    };

    try {
      const res = await fetch(
        `/api/public/projects/${projectId}/forms/${formId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Server returned ${res.status}: ${body}`);
      }

      const saved: Form = await res.json();

      setHeader?.({ saving: false });

      setForm(saved);
      localStorage.removeItem(storageKey);
      setLocalImages({});
    } catch (err: any) {
      console.error("Save failed:", err);
      alert(err.message || "Failed to save form");
    }
  }, [form, projectId, formId, edits, localImages, storageKey]);

  const handlePdfGenerate = useCallback(async () => {
    await handleSave();
    setHeader?.({ generating: true });
    setGenerateError(null);

    try {
      const res = await fetch(`/api/public/projects/${projectId}/forms/${formId}/pdf`,
        { method: "GET" }
      );
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
  }, [projectId, formId]);

  //Use effect to set header buttons
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
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);




  if (loading) return (
    <div className="loading-page">
      <Spinner size={48} />
    </div>
  )
  if (!form) return <p>Inga formulär hittade.</p>;

  return (
      <div className="form-page">
        <h1>{form.title}</h1>
        <p className="small-text">Skapad: {new Date(form.createdAt).toLocaleDateString("sv-SE")} av {form.ownerName || "okänd"}</p>

        <h2>{form.generalSectionTitle}</h2>
        {form.generalSection?.map((field) => (
          <FieldItem
            key={field.fieldId}
            field={field}
            edits={edits}
            localImages={localImages}
            saveOption={saveOption}
            saveComment={saveComment}
            saveImage={saveImage}
            className="form-page-ul-li"
          />
        ))}

        {form.roofSides?.map((side) => (
          <RoofSideSection
            key={side.id}
            roofSide={side}
            edits={edits}
            localImages={localImages}
            saveOption={saveOption}
            saveComment={saveComment}
            saveImage={saveImage}
          />
        ))}

        <form
          className="add-roof-form"
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem("TakfallInput") as HTMLInputElement;
            if (!input.value) return;
            addRoofSideHandler(input.value);
            input.value = "";
          }}
        >
          <label htmlFor="TakfallInput">Lägg till takfall</label>
          <input type="text" name="TakfallInput" placeholder="Namnge takfall" />
          <button type="submit" id="SubmitFormBtn">
            Lägg till takfall
          </button>
        </form>
      </div>
  );
}
