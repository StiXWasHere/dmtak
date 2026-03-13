"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import './projectDetailPage.css';
import CreateFormModal from "@/app/components/FormModal/FormModal";
import Link from "next/link";
import Spinner from "@/app/components/LoadingSpinner/LoadingSpinner";
import WarningModal from "@/app/components/WarningModal/WarningModal";

export default function ProjectPage() {
  const pathname = usePathname(); // e.g., "/projects/abc123"
  const router = useRouter();
  const projectId = pathname.split("/").pop(); // get the last part

  const [project, setProject] = useState<Project | null>(null);
  const [forms, setForms] = useState<{ id: string; title: string; projectId: string }[]>([]);
  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingForms, setLoadingForms] = useState(true);
  const [error, setError] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

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

  async function deleteProject() {
    if (!projectId) return;

    setDeletingProject(true);

    try {
      const res = await fetch(`/api/public/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Server returned ${res.status}: ${body}`);
      }

      router.push("/projects");
    } catch (err: any) {
      console.error("Failed to delete project:", err);
      alert(err.message || "Failed to delete project");
      setDeletingProject(false);
    }
  }

  if (loadingProject) return (
    <div className="loading-page">
      <Spinner size={48} />
    </div>
  );
  if (error) return <p>{error}</p>;
  if (!project) return <p>Inget projekt hittat.</p>;

  return (
    <div className="project-detail-page">
      <div className="project-detail-page-header">
        <h1 className="page-title-1">{project.title}</h1>
        <button
          type="button"
          className="project-detail-page-delete-btn"
          onClick={() => setShowDeleteModal(true)}
          disabled={deletingProject}
        >
          {deletingProject ? "Raderar projekt..." : "Radera projekt"}
        </button>
      </div>
      

      {loadingForms ? (
        <p>Laddar formulär...</p>
      ) : forms.length > 0 ? (
        <div className="project-detail-page-forms">
          <h2>Formulär</h2>
          <ul className="project-detail-page-forms-list">
            {forms.map((form) => (
              <Link key={form.id} href={`/projects/${projectId}/${form.id}`} id="NavNextLinkThin">
                {form.title}
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
      <p className="small-text">Skapad: {new Date(project.createdAt).toLocaleDateString("sv-SE")} av {project.ownerName || "okänd"}</p>

      <WarningModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteProject}
        title="Radera projekt"
        message={`Är du säker på att du vill radera projektet "${project.title}"? Alla formulär i projektet raderas också och åtgärden kan inte ångras.`}
        confirmText="Radera"
        cancelText="Avbryt"
      />
    </div>
  );
}
