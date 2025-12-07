"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import './formPage.css';

export default function FormPage() {
  const { id: projectId, formId } = useParams();

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // track radio selections
  const [selectedOptions, setSelectedOptions] = useState<{ [fieldId: string]: string }>({});
  // track comments
  const [comments, setComments] = useState<{ [fieldId: string]: string }>({});

  useEffect(() => {
    if (!projectId || !formId) return;

    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/public/projects/${projectId}/forms/${formId}`);
        if (!res.ok) throw new Error("Failed to load form");
        const data: Form = await res.json();
        setForm(data);

        // initialize selected options and comments if form already has values
        const initialSelected: { [fieldId: string]: string } = {};
        const initialComments: { [fieldId: string]: string } = {};
        data.generalSection.forEach((field) => {
          initialSelected[field.fieldId] = (field as any).selected || "";
          initialComments[field.fieldId] = field.comment || "";
        });
        setSelectedOptions(initialSelected);
        setComments(initialComments);

      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [projectId, formId]);

  const handleCommentChange = (fieldId: string, value: string) => {
    setComments((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = async () => {
    if (!form) return;

    const updatedFields = form.generalSection.map((field) => ({
      ...field,
      selected: selectedOptions[field.fieldId] || "",
      comment: comments[field.fieldId] || "",
    }));

    const updatedForm = { ...form, generalSection: updatedFields };

    const res = await fetch(`/api/public/projects/${projectId}/forms/${formId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedForm),
    });

    if (!res.ok) {
      alert("Failed to save form");
    } else {
      alert("Form saved successfully");
    }
  };

  if (loading) return <p>Loading form...</p>;
  if (error) return <p>{error}</p>;
  if (!form) return <p>Form not found.</p>;

  return (
    <div className="form-page">
      <h1>{form.title}</h1>
      <p>Created: {new Date(form.createdAt).toLocaleString()}</p>
      <h2>{form.generalSectionTitle}</h2>
      <ul className="form-page-ul">
        {form.generalSection.map((field) => (
          <li key={field.fieldId} className="form-page-ul-li">
            <p>{field.title}</p>
            {field.options && (
            <div>
                {field.options.map((option: 'Godkänt' | 'Ej godkänt' | 'Ej aktuellt' | 'Avhjälpt') => (
                <label key={option}>
                    <input
                    type="radio"
                    name={field.fieldId}
                    value={option}
                    checked={selectedOptions[field.fieldId] === option}
                    onChange={() =>
                        setSelectedOptions((prev) => ({ ...prev, [field.fieldId]: option }))
                    }
                    />
                    {option}
                </label>
                ))}
            </div>
            )}
            <textarea
              value={comments[field.fieldId] || ""}
              onChange={(e) => handleCommentChange(field.fieldId, e.target.value)}
              placeholder="Add comment..."
            />

            {field.imgUrl && (
              <img src={field.imgUrl} alt={field.title} width={150} />
            )}
          </li>
        ))}
      </ul>

      <button onClick={handleSave}>Save Form</button>
    </div>
  );
}
