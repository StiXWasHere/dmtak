"use client";

import { useState } from "react";
import './createTemplatePage.css';

export default function CreateFormTemplatePage() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"Delbesiktning" | "Slutbesiktning" | "Egenkontroll">("Delbesiktning");
  const [generalSectionTitle, setGeneralSectionTitle] = useState("");
  const [fields, setFields] = useState<FormFieldTemplate[]>([]);
  const [status, setStatus] = useState("");

  function addField() {
    setFields([
      ...fields,
      { title: "", fieldId: crypto.randomUUID() }
    ]);
  }

  function updateField(index: number, value: string) {
    const updated = [...fields];
    updated[index].title = value;
    setFields(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Creating...");

    const res = await fetch("/api/admin/submit-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        type,
        generalSectionTitle,
        generalSection: fields,
      }),
    });

    if (res.ok) {
      setStatus("Template created!");
      setTitle("");
      setGeneralSectionTitle("");
      setFields([]);
    } else {
      const data = await res.json();
      setStatus(`Error: ${data.error}`);
    }
  }

  return (
    <div className="template">
      <form className="template-form" onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Form Title"
          required
        />

        <select value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="Delbesiktning">Delbesiktning</option>
          <option value="Slutbesiktning">Slutbesiktning</option>
          <option value="Egenkontroll">Egenkontroll</option>
        </select>

        <input
          value={generalSectionTitle}
          onChange={(e) => setGeneralSectionTitle(e.target.value)}
          placeholder="General Section Title"
          required
        />

        <h4>Fields</h4>
        {fields.map((f, i) => (
          <input
            key={f.fieldId}
            value={f.title}
            onChange={(e) => updateField(i, e.target.value)}
            placeholder={`Field ${i + 1}`}
          />
        ))}

        <button id="SubmitFormBtn" type="button" onClick={addField}>Add Field</button>

        <button id="SubmitFormBtn" type="submit">Create Template</button>

        <p>{status}</p>
      </form>      
    </div>
  );
}
