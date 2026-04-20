"use client";

import { useParams } from "next/navigation";
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

  if (loading) return (
    <div className="loading-page">
      <Spinner size={48} />
    </div>
  );

  if (!form) return <p>Inga formulär hittade.</p>;

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

      <h2>{form.generalSectionTitle}</h2>
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
