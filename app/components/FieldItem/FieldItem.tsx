"use client";

import React, { useState, useEffect, useCallback } from "react";

interface FieldItemProps {
  field: FormField;
  edits: FormEdits;
  localImages: { [fieldId: string]: File[] };
  saveOption: (fieldId: string, option: string) => void;
  saveComment: (fieldId: string, comment: string) => void;
  saveImage: (fieldId: string, files: File[]) => Promise<void>;
  deleteImage: (fieldId: string, imageUrl: string) => Promise<void>;
  className?: string;
  onDelete?: () => void;
}

export const FieldItem = React.memo(({ field, edits, localImages, saveOption, saveComment, saveImage, deleteImage, className, onDelete }: FieldItemProps) => {
  const selected = edits[field.fieldId]?.selected || "";
  const imageUrls = edits[field.fieldId]?.imgUrls?.length
    ? edits[field.fieldId]?.imgUrls || []
    : edits[field.fieldId]?.imgUrl
    ? [edits[field.fieldId]?.imgUrl as string]
    : [];

  // Local state to buffer comment input
  const [localComment, setLocalComment] = useState(edits[field.fieldId]?.comment || "");
  
  // Keep localComment in sync if edits change externally
  useEffect(() => {
    setLocalComment(edits[field.fieldId]?.comment || "");
  }, [edits, field.fieldId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      void saveImage(field.fieldId, files);
    }
    e.target.value = "";
  };

  const handleCommentBlur = () => {
    saveComment(field.fieldId, localComment);
  };

  const localImageCount = localImages[field.fieldId]?.length || 0;

  return (
    <div className={className || "form-page-ul-li"}>
      <div className="field-item-header">
        <p>{field.title}</p>
        {onDelete && (
          <button type="button" id="SubmitFormBtn" onClick={onDelete}>
            Radera fält
          </button>
        )}
      </div>

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
          multiple
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
        {imageUrls.map((url, index) => (
          <div className="field-image-wrapper" key={`${field.fieldId}-${index}-${url}`}>
            <button
              type="button"
              className="delete-image-btn"
              onClick={() => void deleteImage(field.fieldId, url)}
            >
              radera
            </button>
            <img src={url} width={150} />
          </div>
        ))}
        {localImageCount > 0 && (
          <p className="image-uploading-text">Laddar upp {localImageCount} bild(er)...</p>
        )}
      </div>
    </div>
  );
});
