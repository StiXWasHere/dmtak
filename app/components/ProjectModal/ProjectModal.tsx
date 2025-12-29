'use client'
import { useState } from 'react'
import './projectModal.css'

type CreateProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string }) => void;
};

function CreateProjectModal({ open, onClose, onSubmit }: CreateProjectModalProps) {
  const [title, setTitle] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    onSubmit({ title });
    onClose();
  }

  function handleClose(e: React.MouseEvent) {
    e.stopPropagation();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="project-modal" onClick={handleClose}>
      <form className='project-modal-form' onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <label htmlFor="createProject">Ange ett namn för ditt projekt</label>
        <input
            name='createProject'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Projekt titel"
        />
        <button type="submit" id='SubmitFormBtn'>Skapa projekt</button>
      </form>
    </div>
  );
}


export default CreateProjectModal
