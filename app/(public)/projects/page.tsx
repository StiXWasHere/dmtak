'use client'
import { use, useEffect, useState } from "react";
import './projectsPage.css'
import CreateProjectModal from "@/app/components/ProjectModal/ProjectModal";
import Spinner from "@/app/components/LoadingSpinner/LoadingSpinner";
import Link from "next/link";

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function loadProjects(Projects:Project[]) {
    const res = await fetch("/api/public/projects/get-projects");
    const data = await res.json();

    if (Array.isArray(data)) {
      setProjects(data as Project[]);
    }
    setLoading(false);
  }

  async function createProject(values: { title: string }) {
    setStatus("Creating...");

    const res = await fetch("/api/public/projects/create-project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(`Error: ${data.error}`);
      return;
    }

    setTitle("");
    setStatus("Project created!");
    loadProjects(projects);
  }

  useEffect(() => {
    loadProjects(projects);
  }, []);

  return (
    <div className='projects'>
        <div className="projects-page">
            <h1 className="page-title-1">Projekt</h1>
          {loading ? (
            <Spinner size={48} />
          ) : projects.length === 0 ? (
            <p>Inga projekt än</p>
          ) : (
            <ul className="projects-list">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link href={`/projects/${p.id}`} id="NavNextLinkThin">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <button id="SubmitFormBtn" onClick={() => setOpen(true)}>
            Skapa projekt
          </button>
          <CreateProjectModal
            open={open}
            onClose={() => setOpen(false)}
            onSubmit={createProject}
          />
        </div>
    </div>
  )
}

export default ProjectsPage