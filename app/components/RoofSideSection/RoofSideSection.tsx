"use client";

import React, {useState} from "react";
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

  return (
    <div className="roof-side">
      <h3 className="page-title-1">{roofSide.name}</h3>
      <button id="HideFormBtn" type="button" onClick={() => setHidden((v) => !v)}>{hidden ? "Visa" : "Dölj"}</button>
      {!hidden && 
        roofSide.sections.map((section) => (
          <div key={section.id} className="roof-section">
            <h4 className="page-title-2">{section.title}</h4>

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
        ))
      }
    </div>
  );
};
