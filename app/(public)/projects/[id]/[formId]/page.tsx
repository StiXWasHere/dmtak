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

export default function FormPage() {
  const { id: projectId, formId } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [edits, setEdits] = useState<FormEdits>({});
  const [localImages, setLocalImages] = useState<{ [fieldId: string]: File | null }>({});
  const [loading, setLoading] = useState(true);
  

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

const handleSave = async () => {
  if (!form) return;

  console.log("localImages before save:", localImages);
  console.log("edits before save:", edits);

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

  console.log("merged payload:", payload);

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

    setForm(saved);
    localStorage.removeItem(storageKey);
    setLocalImages({});
    alert("Form saved successfully");
  } catch (err: any) {
    console.error("Save failed:", err);
    alert(err.message || "Failed to save form");
  }
};


  if (loading) return <p>Laddar formulär...</p>;
  if (!form) return <p>Inga formulär hittade.</p>;

  return (
    <div className="form-page">
      <h1>{form.title}</h1>
      <p>Skapad: {new Date(form.createdAt).toLocaleString()}</p>

      <h2>{form.generalSectionTitle}</h2>
      {form.generalSection.map((field) => (
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

      <button onClick={handleSave} id="SubmitFormBtn">
        Spara formulär
      </button>
    </div>
  );
}
