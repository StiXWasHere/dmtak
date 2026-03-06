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
import Spinner from "@/app/components/LoadingSpinner/LoadingSpinner";
import { useFormHeader } from "@/app/context/FormHeaderContext";

export default function FormPage() {
  const { id: projectId, formId } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [edits, setEdits] = useState<FormEdits>({});
  const [localImages, setLocalImages] = useState<{ [fieldId: string]: File | null }>({});
  const [loading, setLoading] = useState(true);

  const [customerParticipants, setCustomerParticipants] = useState("");
  const [workerParticipants, setWorkerParticipants] = useState("");

  const [generateError, setGenerateError] = useState<string | null>(null);

  const { setHeader } = useFormHeader();

  const timerRef = useRef<number | null>(null);
  const autoSaveTimerRef = useRef<number | null>(null);
  const storageKey = `form-edits-${projectId}-${formId}`;
  // keep a copy of the whole form object as well – roof sides (and other
  // structural changes) weren't being written to edits, so they vanished when
  // the page re‑loaded.  we'll sync this key whenever `form` changes and
  // restore it when we fetch from the server.
  const formStorageKey = `form-data-${projectId}-${formId}`;

  const fetchForm = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/projects/${projectId}/forms/${formId}`);
      if (!res.ok) throw new Error("Failed to load form");
      let data: Form = await res.json();

      // restore any previously‑saved form structure (roof sides, titles, …)
      // only keep local roof sides that the server hasn’t already discarded.
      const savedForm = localStorage.getItem(formStorageKey);
      if (savedForm) {
        try {
          const parsed: Form = JSON.parse(savedForm);
          if (parsed.roofSides) {
            const serverSides = data.roofSides || [];
            const existingIds = new Set(serverSides.map((s) => s.id));
            // only carry over sides that were created locally (_isLocal flag)
            const newLocals = parsed.roofSides.filter(
              (s: RoofSide) => (s as any)._isLocal && !existingIds.has(s.id)
            );
            data = { ...data, roofSides: [...serverSides, ...newLocals] };
          }
        } catch (err) {
          console.warn("could not parse saved form from storage", err);
        }
      }

      setForm(data);

      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");

      // Initialize edits from DB + localStorage
      // localStorage takes priority so recent unsaved changes aren't overwritten
      const initialEdits: FormEdits = {};
      data.generalSection.forEach((f) => {
        initialEdits[f.fieldId] = {
          selected: saved[f.fieldId]?.selected || f.selected || "",
          comment: saved[f.fieldId]?.comment || f.comment || "",
          imgUrl: saved[f.fieldId]?.imgUrl || f.imgUrl || "",
        };
      });
      data.roofSides?.forEach((side) =>
        side.sections.forEach((section) =>
          section.fields.forEach((f) => {
            initialEdits[f.fieldId] = {
              selected: saved[f.fieldId]?.selected || f.selected || "",
              comment: saved[f.fieldId]?.comment || f.comment || "",
              imgUrl: saved[f.fieldId]?.imgUrl || f.imgUrl || "",
            };
          })
        )
      );
      setEdits(initialEdits);

      // Initialize participants
      setCustomerParticipants(data.customerParticipants || "");
      setWorkerParticipants(data.workerParticipants || "");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to load form");
    } finally {
      setLoading(false);
    }
  }, [projectId, formId, storageKey, formStorageKey]);

  // --- Load form and initialize edits ---
  useEffect(() => {
    if (!projectId || !formId) return;

    fetchForm();
  }, [projectId, formId, fetchForm]);

  // --- Autosave edits to localStorage ---
  useEffect(() => {
    if (!loading) localStorage.setItem(storageKey, JSON.stringify(edits));
  }, [edits, loading]);

  // --- Persist structural changes (roof sides, name changes, etc.) ---
  useEffect(() => {
    if (!loading && form) {
      // persist the full form object including _isLocal flags so that
      // locally-created sides can be detected and restored on reload
      localStorage.setItem(formStorageKey, JSON.stringify(form));
    }
  }, [form, loading, formStorageKey]);


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

  // helper that actually hits the backend; returns saved form or null if
  // nothing changed. does *not* touch header state.
  const lastSavedPayload = useRef<string | null>(null);
  const savingInFlightRef = useRef(false);

  const doSave = useCallback(async (): Promise<Form | null> => {
    if (!form) return null;

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

    const payload = {
      ...form,
      generalSection: updatedGeneral,
      roofSides: updatedRoofSides || [],
      customerParticipants: customerParticipants.trim() || undefined,
      workerParticipants: workerParticipants.trim() || undefined,
    };

    const str = JSON.stringify(payload);
    if (lastSavedPayload.current === str) {
      return null; // nothing to do
    }

    // clear any pending autosave timer since we're saving now
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    const res = await fetch(
      `/api/public/projects/${projectId}/forms/${formId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: str,
      }
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Server returned ${res.status}: ${body}`);
    }

    const saved: Form = await res.json();
    lastSavedPayload.current = str;

    // clear cache keys
    localStorage.removeItem(storageKey);
    localStorage.removeItem(formStorageKey);
    setLocalImages({});

    setForm(saved);
    return saved;
  }, [form, edits, localImages, projectId, formId, storageKey, formStorageKey, customerParticipants, workerParticipants]);

  const handleSave = useCallback(async (e?: React.FormEvent) => {
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

  // --- Autosave to server after inactivity ---
  useEffect(() => {
    if (!form || loading) return;
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
  }, [edits, form, localImages, loading, doSave, customerParticipants, workerParticipants]);

  // reset saved payload when the form object changes (refetch/delete/save)
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

        <div className="participants-section">
          <h4>Deltagare vid besiktning</h4>
          <label htmlFor="customerParticipants" className="participants-section-label">
            Kund:
            <input
              type="text"
              id="customerParticipants"
              value={customerParticipants}
              onChange={(e) => setCustomerParticipants(e.target.value)}
              placeholder="Ange kunddeltagare"
            />
          </label>
          <label htmlFor="workerParticipants" className="participants-section-label">
            Underentrepenör:
            <input 
              type="text"
              id="workerParticipants"
              value={workerParticipants}
              onChange={(e) => setWorkerParticipants(e.target.value)}
              placeholder="Ange arbetardeltagare"
            />
          </label>
        </div>

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
            projectId={projectId as string}
            formId={formId as string}
            onRoofSideDeleted={(id) => {
              // prune any cached copy immediately and then refetch
              const stored = localStorage.getItem(formStorageKey);
              if (stored) {
                try {
                  const parsed: Form = JSON.parse(stored);
                  parsed.roofSides = parsed.roofSides?.filter((s) => s.id !== id);
                  localStorage.setItem(formStorageKey, JSON.stringify(parsed));
                } catch {}
              }
              fetchForm();
            }}
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
