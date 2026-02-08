"use client";

import React, {useState, useRef} from "react";
import { FieldItem } from "@/app/components/FieldItem/FieldItem";

interface RoofSideSectionProps {
  roofSide: RoofSide;
  edits: FormEdits;
  localImages: { [fieldId: string]: File | null };
  saveOption: (fieldId: string, option: string) => void;
  saveComment: (fieldId: string, comment: string) => void;
  saveImage: (fieldId: string, file: File) => void;
}

export const RoofSideSection: React.FC<RoofSideSectionProps> = ({
  roofSide,
  edits,
  localImages,
  saveOption,
  saveComment,
  saveImage,
}) => {
  const [hidden, setHidden] = useState(false);
  const [openSectionId, setOpenSectionId] = useState(null as string | null);

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

  return (
    <div className="roof-side">
      <h3 className="page-title-1">{roofSide.name}</h3>
      <button id="HideFormBtn" type="button" onClick={() => setHidden((v) => !v)}>{hidden ? "Visa" : "Dölj"}</button>
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
    </div>
  );
};
