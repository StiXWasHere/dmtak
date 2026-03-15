"use client";

import React, {useState, useRef} from "react";
import { FieldItem } from "@/app/components/FieldItem/FieldItem";
import WarningModal from "@/app/components/WarningModal/WarningModal";

interface RoofSideSectionProps {
  roofSide: RoofSide;
  edits: FormEdits;
  localImages: { [fieldId: string]: File[] };
  saveOption: (fieldId: string, option: string) => void;
  saveComment: (fieldId: string, comment: string) => void;
  saveImage: (fieldId: string, files: File[]) => Promise<void>;
  deleteImage: (fieldId: string, imageUrl: string) => Promise<void>;
  projectId: string;
  formId: string;
  // callback receives the id of the deleted side so the parent can prune storage
  onRoofSideDeleted: (id: string) => void;
  onAddCustomField: (roofSideId: string, sectionId: string, title: string) => void;
  onRemoveCustomField: (roofSideId: string, sectionId: string, fieldId: string) => void;
}

export const RoofSideSection: React.FC<RoofSideSectionProps> = ({
  roofSide,
  edits,
  localImages,
  saveOption,
  saveComment,
  saveImage,
  deleteImage,
  projectId,
  formId,
  onRoofSideDeleted,
  onAddCustomField,
  onRemoveCustomField,
}) => {
  const [hidden, setHidden] = useState(false);
  const [openSectionId, setOpenSectionId] = useState(null as string | null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customFieldDrafts, setCustomFieldDrafts] = useState<{ [sectionId: string]: string }>({});

  // Create refs for each section
  const sectionRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});

  // Helper to handle opening a section and scrolling
  const handleOpenSection = (sectionId: string, isOpen: boolean) => {
    if (!isOpen) {
      setOpenSectionId(sectionId);
      // Wait for state update and DOM render
      setTimeout(() => {
        const ref = sectionRefs.current[sectionId];
        if (ref) {
          const offset = 40; // px
          const top = ref.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }, 100);
    } else {
      setOpenSectionId(null);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    setDeleting(true);
    try {
      const res = await fetch(`/api/public/projects/${projectId}/forms/${formId}/roof-sides/${roofSide.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete roof side');
      }

      onRoofSideDeleted(roofSide.id);
    } catch (error) {
      console.error('Error deleting roof side:', error);
      alert('Failed to delete roof side. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <div className="roof-side">
      <h3 className="page-title-1">{roofSide.name}</h3>
      <div className="roof-side-controls">
        <button id="HideFormBtn" type="button" onClick={() => setHidden((v) => !v)}>{hidden ? "Visa" : "Dölj"}</button>
        <button 
          type="button" 
          onClick={handleDeleteClick} 
          disabled={deleting}
          className="delete-roof-side-btn"
        >
          {deleting ? "Raderar..." : "Radera takfall"}
        </button>
      </div>
      {!hidden && 
        roofSide.sections.map((section) => {
          const isOpen = openSectionId === section.id;
          return (
            <div
              key={section.id}
              className="roof-section"
              ref={el => { sectionRefs.current[section.id] = el; }}
            >
              <button
                type="button"
                className="section-toggle"
                onClick={() => handleOpenSection(section.id, isOpen)}
                aria-expanded={isOpen}
                aria-controls={`section-body-${section.id}`}
              >
                <p>{section.title}</p>
              </button>

              {isOpen && (
                <div id={`section-body-${section.id}`} className="section-body">
                  {section.fields.map((field) => (
                    <FieldItem
                      key={field.fieldId}
                      field={field}
                      edits={edits}
                      localImages={localImages}
                      saveOption={saveOption}
                      saveComment={saveComment}
                      saveImage={saveImage}
                      deleteImage={deleteImage}
                      className="form-page-ul-li"
                      onDelete={field._isCustom ? () => onRemoveCustomField(roofSide.id, section.id, field.fieldId) : undefined}
                    />
                  ))}

                  <form
                    className="add-custom-field-form"
                    style={{ marginBlock: '2rem' }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const title = (customFieldDrafts[section.id] || "").trim();
                      if (!title) return;
                      onAddCustomField(roofSide.id, section.id, title);
                      setCustomFieldDrafts((prev) => ({ ...prev, [section.id]: "" }));
                    }}
                  >
                    <label htmlFor={`custom-field-${roofSide.id}-${section.id}`}>Lägg till eget fält</label>
                    <input
                      id={`custom-field-${roofSide.id}-${section.id}`}
                      type="text"
                      style={{ width: "100%"}}
                      value={customFieldDrafts[section.id] || ""}
                      placeholder="Fältets titel"
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomFieldDrafts((prev) => ({ ...prev, [section.id]: value }));
                      }}
                    />
                    <button type="submit" id="SubmitFormBtn">Lägg till fält</button>
                  </form>
                </div>
              )}
            </div>
          );
        })
      }
      <WarningModal
        open={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Radera takfall"
        message={`Är du säker på att du vill radera takfallet "${roofSide.name}"? Denna åtgärd kan inte ångras.`}
        confirmText="Bekräfta"
        cancelText="Avbryt"
      />
    </div>
  );
};
