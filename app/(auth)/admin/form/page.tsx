"use client";

import { useState, useEffect } from "react";
import './createTemplatePage.scss';
import WarningModal from "@/app/components/WarningModal/WarningModal";
import Spinner from "@/app/components/LoadingSpinner/LoadingSpinner";

type SectionDraft = {
  id: string;
  title: string;
  fields: FormFieldTemplate[];
};

function emptySection(): SectionDraft {
  return { id: crypto.randomUUID(), title: "", fields: [{ title: "", fieldId: crypto.randomUUID() }] };
}

export default function CreateFormTemplatePage() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<FormTemplate["type"]>("Delbesiktning");
  const [generalSections, setGeneralSections] = useState<SectionDraft[]>([emptySection()]);
  const [roofSideSections, setRoofSideSections] = useState<SectionDraft[]>([emptySection()]);
  const [status, setStatus] = useState("");

  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [templateToDelete, setTemplateToDelete] = useState<FormTemplate | null>(null);

  async function loadTemplates() {
    setLoadingTemplates(true);
    const res = await fetch("/api/public/forms/get-form-templates");
    if (res.ok) setTemplates(await res.json());
    setLoadingTemplates(false);
  }

  useEffect(() => { loadTemplates(); }, []);

  async function handleDeleteTemplate(templateId: string) {
    await fetch("/api/admin/delete-template", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId }),
    });
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  }

  // --- general section operations ---
  function addGeneralSection() {
    setGeneralSections((prev) => [...prev, emptySection()]);
  }

  function removeGeneralSection(id: string) {
    setGeneralSections((prev) => prev.filter((s) => s.id !== id));
  }

  function updateGeneralSectionTitle(id: string, value: string) {
    setGeneralSections((prev) => prev.map((s) => s.id === id ? { ...s, title: value } : s));
  }

  function addGeneralField(sectionId: string) {
    setGeneralSections((prev) => prev.map((s) =>
      s.id === sectionId
        ? { ...s, fields: [...s.fields, { title: "", fieldId: crypto.randomUUID() }] }
        : s
    ));
  }

  function removeGeneralField(sectionId: string, fieldId: string) {
    setGeneralSections((prev) => prev.map((s) =>
      s.id === sectionId
        ? { ...s, fields: s.fields.filter((f) => f.fieldId !== fieldId) }
        : s
    ));
  }

  function updateGeneralField(sectionId: string, fieldId: string, value: string) {
    setGeneralSections((prev) => prev.map((s) =>
      s.id === sectionId
        ? { ...s, fields: s.fields.map((f) => f.fieldId === fieldId ? { ...f, title: value } : f) }
        : s
    ));
  }

  // --- roof side section operations (same pattern) ---
  function addRoofSideSection() {
    setRoofSideSections((prev) => [...prev, emptySection()]);
  }

  function removeRoofSideSection(id: string) {
    setRoofSideSections((prev) => prev.filter((s) => s.id !== id));
  }

  function updateRoofSideSectionTitle(id: string, value: string) {
    setRoofSideSections((prev) => prev.map((s) => s.id === id ? { ...s, title: value } : s));
  }

  function addRoofSideField(sectionId: string) {
    setRoofSideSections((prev) => prev.map((s) =>
      s.id === sectionId
        ? { ...s, fields: [...s.fields, { title: "", fieldId: crypto.randomUUID() }] }
        : s
    ));
  }

  function removeRoofSideField(sectionId: string, fieldId: string) {
    setRoofSideSections((prev) => prev.map((s) =>
      s.id === sectionId
        ? { ...s, fields: s.fields.filter((f) => f.fieldId !== fieldId) }
        : s
    ));
  }

  function updateRoofSideField(sectionId: string, fieldId: string, value: string) {
    setRoofSideSections((prev) => prev.map((s) =>
      s.id === sectionId
        ? { ...s, fields: s.fields.map((f) => f.fieldId === fieldId ? { ...f, title: value } : f) }
        : s
    ));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Skapar mall...");

    const res = await fetch("/api/admin/submit-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        type,
        generalSections: generalSections.map(({ id, title, fields }) => ({ id, title, fields })),
        roofSideSections: roofSideSections.map(({ id, title, fields }) => ({ id, title, fields })),
      }),
    });

    if (res.ok) {
      setStatus("Mall skapad!");
      setTitle("");
      setType("Delbesiktning");
      setGeneralSections([emptySection()]);
      setRoofSideSections([emptySection()]);
      loadTemplates();
    } else {
      const data = await res.json();
      setStatus(`Fel: ${data.error}`);
    }
  }

  return (
    <>
    <div className="template">
      <form className="template-form" onSubmit={handleSubmit}>
        <h2 className="template-form-title">Skapa formulärmall</h2>

        <div className="template-meta">
          <input
            id="templateTitleInput"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mallens titel"
            required
            
          />
          <select id="templateTypeInput" value={type} onChange={(e) => setType(e.target.value as FormTemplate["type"])}>
            <option value="Delbesiktning">Delbesiktning</option>
            <option value="Slutbesiktning">Slutbesiktning</option>
            <option value="Egenkontroll">Egenkontroll</option>
            <option value="Besiktningsutlåtande">Besiktningsutlåtande</option>
          </select>
        </div>

        {/* Standard sektioner */}
        <div className="template-section-group">
          <h3 className="template-section-group-title">Standard sektioner</h3>
          <p className="template-section-group-desc">Generella fält som visas överst i formuläret.</p>

          {generalSections.map((section, si) => (
            <div key={section.id} className="template-section-card">
              <div className="template-section-card-header">
                <input
                  className="template-section-title-input"
                  value={section.title}
                  onChange={(e) => updateGeneralSectionTitle(section.id, e.target.value)}
                  placeholder={`Standard sektion ${si + 1}`}
                  required
                />
                {generalSections.length > 1 && (
                  <button
                    type="button"
                    className="template-remove-btn"
                    onClick={() => removeGeneralSection(section.id)}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="template-section-fields">
                {section.fields.map((field, fi) => (
                  <div key={field.fieldId} className="template-field-row">
                    <input
                      value={field.title}
                      onChange={(e) => updateGeneralField(section.id, field.fieldId, e.target.value)}
                      placeholder={`Fält ${fi + 1}`}
                      required
                    />
                    {section.fields.length > 1 && (
                      <button
                        type="button"
                        className="template-remove-btn template-remove-btn--small"
                        onClick={() => removeGeneralField(section.id, field.fieldId)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="template-add-field-btn"
                onClick={() => addGeneralField(section.id)}
              >
                + Lägg till fält
              </button>
            </div>
          ))}

          <button type="button" className="template-add-section-btn" onClick={addGeneralSection}>
            + Lägg till standard sektion
          </button>
        </div>

        {/* Takfall sektioner */}
        <div className="template-section-group">
          <h3 className="template-section-group-title">Takfall sektioner</h3>
          <p className="template-section-group-desc">Sektioner som visas i varje nytt takfall som läggs till.</p>

          {roofSideSections.map((section, si) => (
            <div key={section.id} className="template-section-card">
              <div className="template-section-card-header">
                <input
                  className="template-section-title-input"
                  value={section.title}
                  onChange={(e) => updateRoofSideSectionTitle(section.id, e.target.value)}
                  placeholder={`Takfall sektion ${si + 1}`}
                  required
                />
                {roofSideSections.length > 1 && (
                  <button
                    type="button"
                    className="template-remove-btn"
                    onClick={() => removeRoofSideSection(section.id)}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="template-section-fields">
                {section.fields.map((field, fi) => (
                  <div key={field.fieldId} className="template-field-row">
                    <input
                      value={field.title}
                      onChange={(e) => updateRoofSideField(section.id, field.fieldId, e.target.value)}
                      placeholder={`Fält ${fi + 1}`}
                      required
                    />
                    {section.fields.length > 1 && (
                      <button
                        type="button"
                        className="template-remove-btn template-remove-btn--small"
                        onClick={() => removeRoofSideField(section.id, field.fieldId)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="template-add-field-btn"
                onClick={() => addRoofSideField(section.id)}
              >
                + Lägg till fält
              </button>
            </div>
          ))}

          <button type="button" className="template-add-section-btn" onClick={addRoofSideSection}>
            + Lägg till takfall sektion
          </button>
        </div>

        <button id="SubmitFormBtn" type="submit">Skapa mall</button>

        {status && <p className="template-status">{status}</p>}
      </form>

      {/* Existing templates */}
      <div className="template-list">
        <h3 className="template-list-title">Befintliga mallar</h3>
        {loadingTemplates ? (
          <Spinner size={32} />
        ) : templates.length === 0 ? (
          <p className="template-list-empty">Inga mallar skapade ännu.</p>
        ) : (
          templates.map((t) => (
            <div key={t.id} className="template-list-item">
              <div className="template-list-item-info">
                <strong>{t.title}</strong>
                <span className="template-list-item-type">{t.type}</span>
                <span className="template-list-item-date">
                  {new Date(t.createdAt).toLocaleDateString("sv-SE")}
                </span>
              </div>
              <button
                type="button"
                className="template-remove-btn"
                onClick={() => setTemplateToDelete(t)}
              >
                Ta bort
              </button>
            </div>
          ))
        )}
      </div>


    </div>      
    <WarningModal
        open={templateToDelete !== null}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={() => templateToDelete && handleDeleteTemplate(templateToDelete.id)}
        title="Ta bort mall"
        message={`Är du säker på att du vill ta bort mallen "${templateToDelete?.title}"? Formulär skapade från den påverkas inte.`}
        confirmText="Ta bort"
      />
      </>
  );
}
