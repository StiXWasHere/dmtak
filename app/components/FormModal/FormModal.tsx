"use client";

import { useEffect, useState } from "react";
import './formModal.css'

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; templateId: string }) => void;
};

export default function CreateFormModal({ open, onClose, onSubmit }: Props) {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState("");

  // load templates when opened
  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/public/forms/get-form-templates");
        if (!res.ok) throw new Error("Failed to load templates");

        const data = await res.json();
        setTemplates(data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open]);

  const handleSubmit = () => {
    if (!title.trim() || !templateId) return;

    onSubmit({
      title: title.trim(),
      templateId,
    });

    // reset state
    setTitle("");
    setTemplateId("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="form-modal">
      <div>
        <h2>Create Form</h2>

        {loading && <p>Loading templates…</p>}
        {error && <p>{error}</p>}

        {!loading && (
          <>
            <div>
              <label>Form title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div >
              <label >Template</label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                <option value="">Select template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={onClose}
                id="SubmitFormBtn"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                id="SubmitFormBtn"
                disabled={!title.trim() || !templateId}
              >
                Create
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
