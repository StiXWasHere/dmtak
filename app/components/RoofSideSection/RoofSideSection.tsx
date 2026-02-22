"use client";

import React, {useState, useRef} from "react";
import { FieldItem } from "@/app/components/FieldItem/FieldItem";
import WarningModal from "@/app/components/WarningModal/WarningModal";

interface RoofSideSectionProps {
  roofSide: RoofSide;
  edits: FormEdits;
  localImages: { [fieldId: string]: File | null };
  saveOption: (fieldId: string, option: string) => void;
  saveComment: (fieldId: string, comment: string) => void;
  saveImage: (fieldId: string, file: File) => void;
  projectId: string;
  formId: string;
  onRoofSideDeleted: () => void;
}

export const RoofSideSection: React.FC<RoofSideSectionProps> = ({
  roofSide,
  edits,
  localImages,
  saveOption,
  saveComment,
  saveImage,
  projectId,
  formId,
  onRoofSideDeleted,
}) => {
  const [hidden, setHidden] = useState(false);
  const [openSectionId, setOpenSectionId] = useState(null as string | null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

      onRoofSideDeleted();
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
                      className="form-page-ul-li"
                    />
                  ))}
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
