"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import './projectDetailPage.css';
import CreateFormModal from "@/app/components/FormModal/FormModal";
import Link from "next/link";

export default function ProjectPage() {
  const pathname = usePathname(); // e.g., "/projects/abc123"
  const projectId = pathname.split("/").pop(); // get the last part

  const [project, setProject] = useState<Project | null>(null);
  const [forms, setForms] = useState<{ id: string; title: string; projectId: string }[]>([]);
  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingForms, setLoadingForms] = useState(true);
  const [error, setError] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);

  // fetch project
  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/public/projects/${projectId}`);
        if (!res.ok) throw new Error("Failed to load project: " + res.statusText);
        const data: Project = await res.json();
        setProject(data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoadingProject(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // fetch forms
  useEffect(() => {
    if (!projectId) return;

    const fetchForms = async () => {
      try {
        const res = await fetch(`/api/public/projects/${projectId}/forms`);
        if (!res.ok) throw new Error("Failed to load forms");
        const data = await res.json();
        setForms(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingForms(false);
      }
    };

    fetchForms();
  }, [projectId]);

  // create form
  async function createForm(title: string, templateId: string) {
    await fetch("/api/public/forms/create-form", {
      method: "POST",
      body: JSON.stringify({ projectId, title, templateId }),
    });

    // reload forms list after creation
    if (projectId) {
      setLoadingForms(true);
      const res = await fetch(`/api/public/projects/${projectId}/forms`);
      const updated = await res.json();
      setForms(updated);
      setLoadingForms(false);
    }
  }

  if (loadingProject) return <p>Laddar projekt...</p>;
  if (error) return <p>{error}</p>;
  if (!project) return <p>Inget projekt hittat.</p>;

  return (
    <div className="project-detail-page">
      <h1 className="page-title-1">{project.title}</h1>
      <p>Skapad: {new Date(project.createdAt).toLocaleString()}</p>

      {loadingForms ? (
        <p>Laddar formulär...</p>
      ) : forms.length > 0 ? (
        <div className="project-detail-page-forms">
          <h2>Forms</h2>
          <ul className="project-detail-page-forms-list">
            {forms.map((form) => (
              <Link key={form.id} href={`/projects/${projectId}/${form.id}`}>
                <button id="NavBtnThin">{form.title}</button>
              </Link>
            ))}
          </ul>
        </div>
      ) : (
        <div className="project-detail-page-forms">
          <p>Inga formulär har skapats än.</p>
        </div>
      )}

      <div className="project-detail-page-modal">
        <button id="SubmitFormBtn" onClick={() => setShowFormModal(true)}>
          Skapa formulär
        </button>

        <CreateFormModal
          open={showFormModal}
          onClose={() => setShowFormModal(false)}
          onSubmit={({ title, templateId }) => createForm(title, templateId)}
        />
      </div>
    </div>
  );
}
