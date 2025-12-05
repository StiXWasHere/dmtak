"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import './projectDetailPage.css';
import CreateFormModal from "@/app/components/FormModal/FormModal";

export default function ProjectPage() {
  const pathname = usePathname(); // e.g., "/projects/abc123"
  const projectId = pathname.split("/").pop(); // get the last part

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);

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
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  async function createForm(title: string, templateId: string) {
  await fetch("/api/public/forms/create-form", {
        method: "POST",
        body: JSON.stringify({ projectId, title, templateId }),
    });
    }


  if (loading) return <p>Loading project...</p>;
  if (error) return <p>{error}</p>;
  if (!project) return <p>No project found.</p>;

  return (
    <div className="project-detail-page">
      <h1 className="page-title-1">{project.title}</h1>
      <p>Created: {new Date(project.createdAt).toLocaleString()}</p>

      {project.forms.length > 0 ? (
        <div className="project-detail-page-forms">
          <h2>Forms</h2>
          <ul className="project-detail-page-forms-list">
            {project.forms.map((form) => (
              <li key={form.id}>{form.title}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="project-detail-page-forms">
            <p>No forms yet.</p>            
        </div>
      )}
      <div className="project-detail-page-modal">
        <button id="SubmitFormBtn" onClick={() => setShowFormModal(true)}>Skapa formulär</button>
        <CreateFormModal
            open={showFormModal}
            onClose={() => setShowFormModal(false)}
            onSubmit={({ title, templateId}) => createForm(title, templateId)}
        />        
      </div>
    </div>
  );
}
