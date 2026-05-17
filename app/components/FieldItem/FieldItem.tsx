"use client";

import React, { useState, useEffect, useRef } from "react";
import { ReactSketchCanvas, type ReactSketchCanvasRef } from "react-sketch-canvas";
import "./FieldItem.css";

interface FieldItemProps {
  field: FormField;
  edits: FormEdits;
  localImages: { [fieldId: string]: File[] };
  uploadError?: string;
  saveOption: (fieldId: string, option: string) => void;
  saveComment: (fieldId: string, comment: string) => void;
  saveImage: (fieldId: string, files: File[]) => Promise<void>;
  deleteImage: (fieldId: string, imageUrl: string) => Promise<void>;
  className?: string;
  onDelete?: () => void;
}

export const FieldItem = React.memo(({ field, edits, localImages, uploadError, saveOption, saveComment, saveImage, deleteImage, className, onDelete }: FieldItemProps) => {
  const selected = edits[field.fieldId]?.selected || "";
  const imageUrls = edits[field.fieldId]?.imgUrls?.length
    ? edits[field.fieldId]?.imgUrls || []
    : edits[field.fieldId]?.imgUrl
    ? [edits[field.fieldId]?.imgUrl as string]
    : [];

  // Local state to buffer comment input
  const [localComment, setLocalComment] = useState(edits[field.fieldId]?.comment || "");
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showAnnotator, setShowAnnotator] = useState(false);
  const [imageToAnnotate, setImageToAnnotate] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const annotateInputRef = useRef<HTMLInputElement | null>(null);
  const annotatorRef = useRef<ReactSketchCanvasRef | null>(null);
  
  // Keep localComment in sync if edits change externally
  useEffect(() => {
    setLocalComment(edits[field.fieldId]?.comment || "");
  }, [edits, field.fieldId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const touchMedia = window.matchMedia("(pointer: coarse)");
    const isTouch =
      navigator.maxTouchPoints > 0 ||
      touchMedia.matches ||
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsTouchDevice(isTouch);
  }, []);

  useEffect(() => {
    if (!imageToAnnotate) {
      setImagePreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(imageToAnnotate);
    setImagePreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageToAnnotate]);

  const openAnnotatePicker = () => {
    annotateInputRef.current?.click();
  };

  const handleAnnotateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setImageToAnnotate(file);
      setShowAnnotator(true);
    }
    e.target.value = "";
  };

  const handleAnnotatorSave = async () => {
    if (!annotatorRef.current || !imageToAnnotate) {
      setShowAnnotator(false);
      setImageToAnnotate(null);
      return;
    }

    try {
      const dataUrl = await annotatorRef.current.exportImage("png");
      const blob = await fetch(dataUrl).then((res) => res.blob());
      const annotatedFile = new File([blob], `annotated-${imageToAnnotate.name}`, {
        type: "image/png",
      });
      await saveImage(field.fieldId, [annotatedFile]);
    } catch (error) {
      console.error("[ImageAnnotator] Failed to save annotated image", error);
    } finally {
      setShowAnnotator(false);
      setImageToAnnotate(null);
    }
  };

  const handleAnnotatorCancel = () => {
    setShowAnnotator(false);
    setImageToAnnotate(null);
  };

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
        <input
          ref={annotateInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={handleAnnotateFileChange}
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

        {isTouchDevice && (
          <button
            type="button"
            id="ImgAnnotateBtn"
            className="annotate-mobile-button"
            onClick={openAnnotatePicker}
          >
            ✎
          </button>
        )}

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
        {uploadError && (
          <p className="image-upload-error" role="alert">{uploadError}</p>
        )}

        {showAnnotator && imagePreviewUrl && (
          <div className="image-annotator-modal" role="dialog" aria-modal="true">
            <div className="image-annotator-dialog">
              <div className="image-annotator-header">
                <strong>Rita på bilden</strong>
                <button type="button" className="annotator-close-btn" onClick={handleAnnotatorCancel}>
                  Stäng
                </button>
              </div>
              <div className="image-annotator-body">
                <div className="image-annotator-canvas-wrapper">
                  <ReactSketchCanvas
                    ref={annotatorRef}
                    width="100%"
                    height="100%"
                    strokeWidth={4}
                    strokeColor="red"
                    backgroundImage={imagePreviewUrl}
                    exportWithBackgroundImage={true}
                    preserveBackgroundImageAspectRatio="xMidYMid slice"
                    style={{ touchAction: "none", width: "100%", height: "100%" }}
                  />
                </div>
              </div>
              <div className="image-annotator-footer">
                <button type="button" className="annotator-cancel-btn" onClick={handleAnnotatorCancel}>
                  Avbryt
                </button>
                <button type="button" className="annotator-save-btn" onClick={handleAnnotatorSave}>
                  Spara och ladda upp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
