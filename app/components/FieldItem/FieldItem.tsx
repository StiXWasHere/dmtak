"use client";

import React, { useState, useEffect, useCallback } from "react";

interface FieldItemProps {
  field: FormField;
  edits: FormEdits;
  localImages: { [fieldId: string]: File | null };
  saveOption: (fieldId: string, option: string) => void;
  saveComment: (fieldId: string, comment: string) => void;
  saveImage: (fieldId: string, file: File) => void;
  className?: string;
}

export const FieldItem = React.memo(({ field, edits, localImages, saveOption, saveComment, saveImage, className }: FieldItemProps) => {
  const selected = edits[field.fieldId]?.selected || "";
  const imgUrl = edits[field.fieldId]?.imgUrl;

  // Local state to buffer comment input
  const [localComment, setLocalComment] = useState(edits[field.fieldId]?.comment || "");
  
  // Keep localComment in sync if edits change externally
  useEffect(() => {
    setLocalComment(edits[field.fieldId]?.comment || "");
  }, [edits, field.fieldId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) saveImage(field.fieldId, file);
  };

  const handleCommentBlur = () => {
    saveComment(field.fieldId, localComment);
  };

  return (
    <div className={className || "form-page-ul-li"}>
      <p>{field.title}</p>

      {field.options && (
        <div className="form-page-ul-li-input">
          {field.options.map((option: 'Godkänt'| 'Ej godkänt'| 'Ej aktuellt' | 'Avhjälpt' | 'Ej utförd') => (
            <label key={option} className="radio-label">
              <input
                type="radio"
                className="radio-input"
                name={field.fieldId}
                value={option}
                checked={selected === option}
                onChange={() => saveOption(field.fieldId, option)}
              />
              <span className="radio-box"></span>
              {option}
            </label>
          ))}
        </div>
      )}

      <textarea
        className="form-textarea"
        value={localComment}
        onChange={(e) => setLocalComment(e.target.value)}
        onBlur={handleCommentBlur}
        placeholder="Övrig kommentar"
      />

      <div className="form-page-ul-li-img-container">
        <input
          type="file"
          accept="image/*"
          id={`file-${field.fieldId}`}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <button
          type="button"
          id="ImgSubmitBtn"
          onClick={() => {
            const el = document.getElementById(`file-${field.fieldId}`) as HTMLInputElement;
            el?.click();
          }}
        >
          +
        </button>

        {localImages[field.fieldId] ? (
          <img src={URL.createObjectURL(localImages[field.fieldId]!)} width={150} />
        ) : imgUrl ? (
          <img src={imgUrl} width={150} />
        ) : null}
      </div>
    </div>
  );
});
