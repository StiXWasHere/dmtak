"use client";

import React, { useState, useEffect, useRef } from "react";
import { ReactSketchCanvas, type ReactSketchCanvasRef } from "react-sketch-canvas";
import Spinner from "@/app/components/LoadingSpinner/LoadingSpinner";
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
  const [showAnnotator, setShowAnnotator] = useState(false);
  const [imageToAnnotate, setImageToAnnotate] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [canvasDims, setCanvasDims] = useState<{ width: number; height: number } | null>(null);
  const [strokeColor, setStrokeColor] = useState("#e53e3e");
  const [isSaving, setIsSaving] = useState(false);
  const annotateInputRef = useRef<HTMLInputElement | null>(null);
  const annotatorRef = useRef<ReactSketchCanvasRef | null>(null);
  
  // Keep localComment in sync if edits change externally
  useEffect(() => {
    setLocalComment(edits[field.fieldId]?.comment || "");
  }, [edits, field.fieldId]);

  useEffect(() => {
    if (!imageToAnnotate) {
      setImagePreviewUrl(null);
      setImageDimensions(null);
      setCanvasDims(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      const img = new Image();
      img.onload = () => {
        const native = { width: img.naturalWidth, height: img.naturalHeight };
        setImageDimensions(native);

        // Bake EXIF rotation into the pixel data. Browsers apply EXIF orientation
        // when rendering an <img>, but SVG rasterizers (librsvg/sharp) do not read
        // EXIF from embedded images, so without this the photo would appear rotated
        // in the exported SVG. Drawing through a canvas produces an orientation-
        // corrected JPEG with no rotation tag.
        const offscreen = document.createElement("canvas");
        offscreen.width = native.width;
        offscreen.height = native.height;
        const ctx = offscreen.getContext("2d");
        const correctedUrl = ctx
          ? (ctx.drawImage(img, 0, 0), offscreen.toDataURL("image/jpeg", 0.92))
          : dataUrl;
        setImagePreviewUrl(correctedUrl);

        // Scale the canvas to fit the modal while preserving the native aspect ratio.
        // Leave ~200px for the modal header + footer.
        const maxW = Math.min(window.innerWidth * 0.85, 900);
        const maxH = window.innerHeight * 0.6;
        const scale = Math.min(maxW / native.width, maxH / native.height, 1);
        setCanvasDims({
          width: Math.round(native.width * scale),
          height: Math.round(native.height * scale),
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(imageToAnnotate);

    return () => {
      setImageDimensions(null);
      setCanvasDims(null);
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

  const dataUrlToBlob = (dataUrl: string) => {
    const [header, base64] = dataUrl.split(",");
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const binary = atob(base64);
    const length = binary.length;
    const array = new Uint8Array(length);

    for (let i = 0; i < length; i += 1) {
      array[i] = binary.charCodeAt(i);
    }

    return new Blob([array], { type: mime });
  };

  const handleAnnotatorSave = async () => {
    if (!annotatorRef.current || !imageToAnnotate) {
      setShowAnnotator(false);
      setImageToAnnotate(null);
      return;
    }

    setIsSaving(true);
    try {
      // Export as SVG and send SVG to server for rasterization to preserve quality
      const svg = await annotatorRef.current.exportSvg();
      const svgBlob = new Blob([svg], { type: "image/svg+xml" });
      const annotatedFile = new File([svgBlob], `annotated-${imageToAnnotate.name.replace(/\.[^.]+$/, ".svg")}`, {
        type: "image/svg+xml",
      });

      console.log("[ImageAnnotator] Exported annotated SVG", {
        originalName: imageToAnnotate.name,
        annotatedName: annotatedFile.name,
        annotatedType: annotatedFile.type,
        annotatedSize: annotatedFile.size,
        svgPreview: svg.slice(0, 200),
      });

      await saveImage(field.fieldId, [annotatedFile]);
    } catch (error) {
      console.error("[ImageAnnotator] Failed to save annotated image", error);
    } finally {
      setIsSaving(false);
      setShowAnnotator(false);
      setImageToAnnotate(null);
      setStrokeColor("#e53e3e");
    }
  };

  const handleAnnotatorCancel = () => {
    setShowAnnotator(false);
    setImageToAnnotate(null);
    setStrokeColor("#e53e3e");
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
          onClick={openAnnotatePicker}
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
        {uploadError && (
          <p className="image-upload-error" role="alert">{uploadError}</p>
        )}

        {showAnnotator && imagePreviewUrl && (
          <div className="image-annotator-modal" role="dialog" aria-modal="true">
            <div className="image-annotator-dialog" style={{ position: "relative" }}>
              {isSaving && (
                <div className="annotator-saving-overlay">
                  <Spinner size={40} />
                  <span className="annotator-saving-label">Laddar upp...</span>
                </div>
              )}
              <div className="image-annotator-header">
                <strong>Rita på bilden</strong>
                <button type="button" className="annotator-close-btn" onClick={handleAnnotatorCancel}>
                  Stäng
                </button>
              </div>
              <div className="image-annotator-toolbar">
                <div className="annotator-colors">
                  {["#e53e3e", "#000000", "#1d4ed8", "#16a34a", "#f59e0b", "#ffffff"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`annotator-color-swatch${strokeColor === color ? " annotator-color-swatch--active" : ""}`}
                      style={{ background: color }}
                      onClick={() => setStrokeColor(color)}
                      aria-label={color}
                    />
                  ))}
                </div>
                <div className="annotator-actions">
                  <button type="button" className="annotator-tool-btn" onClick={() => annotatorRef.current?.undo()}>
                    Ångra
                  </button>
                  <button type="button" className="annotator-tool-btn" onClick={() => annotatorRef.current?.clearCanvas()}>
                    Rensa
                  </button>
                </div>
              </div>
              <div className="image-annotator-body">
                <div className="image-annotator-canvas-wrapper">
                  <ReactSketchCanvas
                    ref={annotatorRef}
                    width={canvasDims ? `${canvasDims.width}px` : "100%"}
                    height={canvasDims ? `${canvasDims.height}px` : "100%"}
                    strokeWidth={4}
                    strokeColor={strokeColor}
                    backgroundImage={imagePreviewUrl ?? undefined}
                    exportWithBackgroundImage={true}
                    preserveBackgroundImageAspectRatio="none"
                    style={{ touchAction: "none", display: "block" }}
                  />
                </div>
              </div>
              <div className="image-annotator-footer">
                <button type="button" className="annotator-cancel-btn" onClick={handleAnnotatorCancel} disabled={isSaving}>
                  Avbryt
                </button>
                <button type="button" className="annotator-save-btn" onClick={handleAnnotatorSave} disabled={isSaving}>
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
