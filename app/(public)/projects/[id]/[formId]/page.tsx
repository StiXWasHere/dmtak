"use client";

import { useParams } from "next/navigation";
import { useState, useRef } from "react";
import { FieldItem } from "@/app/components/FieldItem/FieldItem";
import { RoofSideSection } from "@/app/components/RoofSideSection/RoofSideSection";
import "./formPage.css";
import Spinner from "@/app/components/LoadingSpinner/LoadingSpinner";
import WarningModal from "@/app/components/WarningModal/WarningModal";
import { useProjectFormPage } from "@/app/hooks/useProjectFormPage";

export default function FormPage() {
  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
  const formId = Array.isArray(params.formId) ? params.formId[0] : params.formId;

  const {
    form,
    edits,
    localImages,
    uploadErrors,
    loading,
    showDeleteModal,
    deletingForm,
    customerParticipants,
    workerParticipants,
    companyParticipants,
    canDeleteForm,
    saveOption,
    saveComment,
    saveImage,
    deleteImage,
    addRoofSideHandler,
    handleAddCustomField,
    handleRemoveCustomField,
    handleDeleteForm,
    onRoofSideDeleted,
    setShowDeleteModal,
    setCustomerParticipants,
    setWorkerParticipants,
    setCompanyParticipants,
  } = useProjectFormPage({ projectId, formId });

  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const generalSectionRef = useRef<HTMLDivElement | null>(null);

  const handleGeneralSectionToggle = () => {
    if (openSectionId !== "general") {
      setOpenSectionId("general");
      setTimeout(() => {
        if (generalSectionRef.current) {
          const offset = 40;
          const top = generalSectionRef.current.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }, 100);
    } else {
      setOpenSectionId(null);
    }
  };

  const handleSectionToggle = (sectionId: string) => {
    setOpenSectionId((prev) => (prev === sectionId ? null : sectionId));
  };

  if (loading) return (
    <div className="loading-page">
      <Spinner size={48} />
    </div>
  );

  if (!form) return <p>Inga formulär hittade.</p>;

  const COMPLETED_OPTIONS = new Set(['Godkänt', 'Avhjälpt', 'Ej aktuellt']);

  // legacy single general section stats
  const generalApproved = form.generalSection?.filter(f => COMPLETED_OPTIONS.has(edits[f.fieldId]?.selected ?? f.selected ?? '')).length ?? 0;
  const generalTotal = form.generalSection?.length ?? 0;
  const generalStatus = generalTotal > 0 && generalApproved === generalTotal ? 'complete' : generalApproved > 0 ? 'partial' : null;

  const hasMultipleGeneralSections = (form.generalSections?.length ?? 0) > 0;

  return (
    <div className="form-page">
      <div className="form-page-header">
        <h1>{form.title}</h1>
        {canDeleteForm && (
          <button
            type="button"
            className="form-page-delete-btn"
            onClick={() => setShowDeleteModal(true)}
            disabled={deletingForm}
          >
            {deletingForm ? "Raderar formulär..." : "Radera formulär"}
          </button>
        )}
      </div>

      <p className="small-text">
        Skapad: {new Date(form.createdAt).toLocaleDateString("sv-SE")} av {form.ownerName || "okänd"}
      </p>

      <div className="participants-section">
        <h4>Deltagare vid besiktning</h4>
        <label htmlFor="customerParticipants" className="participants-section-label">
          Kund:
          <input
            type="text"
            id="customerParticipants"
            value={customerParticipants}
            onChange={(e) => setCustomerParticipants(e.target.value)}
          />
        </label>
        <label htmlFor="workerParticipants" className="participants-section-label">
          Underentrepenör:
          <input
            type="text"
            id="workerParticipants"
            value={workerParticipants}
            onChange={(e) => setWorkerParticipants(e.target.value)}
          />
        </label>
        <label htmlFor="companyParticipants" className="participants-section-label">
          Utförare:
          <input 
            type="text" 
            id="companyParticipants"
            value={companyParticipants}
            onChange={(e) => setCompanyParticipants(e.target.value)}
          />
        </label>
      </div>

      {hasMultipleGeneralSections
        ? form.generalSections!.map((section) => {
            const secApproved = section.fields.filter(f =>
              COMPLETED_OPTIONS.has(edits[f.fieldId]?.selected ?? f.selected ?? '')
            ).length;
            const secTotal = section.fields.length;
            const secStatus = secTotal > 0 && secApproved === secTotal ? 'complete' : secApproved > 0 ? 'partial' : null;
            return (
              <div className="roof-section" key={section.id}>
                <button
                  type="button"
                  className={`section-toggle${secStatus ? ` section-toggle--${secStatus}` : ''}`}
                  onClick={() => handleSectionToggle(section.id)}
                  aria-expanded={openSectionId === section.id}
                >
                  <span>{section.title}</span>
                  <span>{secApproved}/{secTotal}</span>
                </button>
                {openSectionId === section.id && (
                  <div className="section-body">
                    {section.fields.map((field) => (
                      <FieldItem
                        key={field.fieldId}
                        field={field}
                        edits={edits}
                        localImages={localImages}
                        uploadError={uploadErrors[field.fieldId] || undefined}
                        saveOption={saveOption}
                        saveComment={saveComment}
                        saveImage={saveImage}
                        deleteImage={deleteImage}
                        className="form-page-ul-li"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        : (
          <div className="roof-section" ref={generalSectionRef}>
            <button
              type="button"
              className={`section-toggle${generalStatus ? ` section-toggle--${generalStatus}` : ''}`}
              onClick={handleGeneralSectionToggle}
              aria-expanded={openSectionId === "general"}
              aria-controls="general-section-body"
            >
              <span>{form.generalSectionTitle}</span>
              <span>{generalApproved}/{generalTotal}</span>
            </button>
            {openSectionId === "general" && (
              <div id="general-section-body" className="section-body">
                {form.generalSection?.map((field) => (
                  <FieldItem
                    key={field.fieldId}
                    field={field}
                    edits={edits}
                    localImages={localImages}
                    uploadError={uploadErrors[field.fieldId] || undefined}
                    saveOption={saveOption}
                    saveComment={saveComment}
                    saveImage={saveImage}
                    deleteImage={deleteImage}
                    className="form-page-ul-li"
                  />
                ))}
              </div>
            )}
          </div>
        )
      }

      {form.roofSides?.map((side) => (
        <RoofSideSection
          key={side.id}
          roofSide={side}
          edits={edits}
          localImages={localImages}
          uploadErrors={uploadErrors}
          saveOption={saveOption}
          saveComment={saveComment}
          saveImage={saveImage}
          deleteImage={deleteImage}
          projectId={projectId as string}
          formId={formId as string}
          onAddCustomField={handleAddCustomField}
          onRemoveCustomField={handleRemoveCustomField}
          onRoofSideDeleted={onRoofSideDeleted}
          openSectionId={openSectionId}
          onOpenSection={setOpenSectionId}
        />
      ))}

      <form
        className="add-roof-form"
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem("TakfallInput") as HTMLInputElement;
          if (!input.value) return;
          addRoofSideHandler(input.value);
          input.value = "";
        }}
      >
        <label htmlFor="TakfallInput">Lägg till takfall</label>
        <input type="text" name="TakfallInput" placeholder="Namnge takfall" />
        <button type="submit" id="SubmitFormBtn">
          Lägg till takfall
        </button>
      </form>

      {canDeleteForm && (
        <WarningModal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteForm}
          title="Radera formulär"
          message={`Är du säker på att du vill radera formuläret "${form.title}"? Denna åtgärd kan inte ångras.`}
          confirmText="Radera"
          cancelText="Avbryt"
        />
      )}
    </div>
  );
}
