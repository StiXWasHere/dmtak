'use client'
import React from 'react'
import './WarningModal.scss'

type WarningModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

function WarningModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Bekräfta",
  cancelText = "Avbryt"
}: WarningModalProps) {
  function handleConfirm(e: React.MouseEvent) {
    e.stopPropagation();
    onConfirm();
    onClose();
  }

  function handleClose(e: React.MouseEvent) {
    e.stopPropagation();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="warning-modal" onClick={handleClose}>
      <div className='warning-modal-content' onClick={(e) => e.stopPropagation()}>
        <h2 className="warning-modal-title">{title}</h2>
        <p className="warning-modal-message">{message}</p>
        <div className="warning-modal-actions">
          <button
            type="button"
            className="warning-modal-cancel"
            onClick={handleClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="warning-modal-confirm"
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WarningModal
