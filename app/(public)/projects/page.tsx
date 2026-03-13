'use client'
import { useEffect, useState } from "react";
import './projectsPage.css'
import CreateProjectModal from "@/app/components/ProjectModal/ProjectModal";
import Spinner from "@/app/components/LoadingSpinner/LoadingSpinner";
import Link from "next/link";

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<string>("all");

  // Sort projects by creation date (newest first)
  const sortProjectsByDate = (projectsToSort: Project[]): Project[] => {
    return [...projectsToSort].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  };

  // Get unique owners from projects
  const getUniqueOwners = (projectsList: Project[]): { id: string; name: string }[] => {
    const ownerMap = new Map<string, string>();
    projectsList.forEach((project) => {
      if (project.ownerId && project.ownerName) {
        ownerMap.set(project.ownerId, project.ownerName);
      }
    });
    return Array.from(ownerMap.entries()).map(([id, name]) => ({ id, name }));
  };

  // Filter and sort projects based on selected owner
  const applyFilters = (projectsList: Project[], owner: string, titleSearch: string) => {
    let result = projectsList;
    const normalizedTitleSearch = titleSearch.trim().toLowerCase();

    if (owner !== "all") {
      result = result.filter((p) => p.ownerId === owner);
    }

    if (normalizedTitleSearch) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(normalizedTitleSearch),
      );
    }

    return sortProjectsByDate(result);
  };

  async function loadProjects(Projects:Project[]) {
    const res = await fetch("/api/public/projects/get-projects");
    const data = await res.json();

    if (Array.isArray(data)) {
      const sortedProjects = sortProjectsByDate(data as Project[]);
      setProjects(sortedProjects);
      setFilteredProjects(sortedProjects);
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

    setStatus("Project created!");
    loadProjects(projects);
  }

  useEffect(() => {
    loadProjects(projects);
  }, []);

  useEffect(() => {
    const filtered = applyFilters(projects, selectedOwner, searchTitle);
    setFilteredProjects(filtered);
  }, [selectedOwner, searchTitle, projects]);

  return (
    <div className='projects'>
        <div className="projects-page">
            <h1 className="page-title-1">Projekt</h1>
            {!loading && projects.length > 0 && (
              <div className="projects-filter">
                <div className="projects-filter-section">
                  <label htmlFor="titleFilter">
                    Sök titel:
                  </label>
                    <input
                      id="titleFilter"
                      type="text"
                      value={searchTitle}
                      onChange={(e) => setSearchTitle(e.target.value)}
                      placeholder="Skriv projektnamn"
                    />                  
                </div>                
                <div className="projects-filter-section">
                  <label htmlFor="ownerFilter">
                    Filtrera efter ägare:
                  </label>
                  <select
                    id="ownerFilter"
                    value={selectedOwner}
                    onChange={(e) => setSelectedOwner(e.target.value)}
                  >
                    <option value="all">Alla</option>
                    {getUniqueOwners(projects).map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name}
                      </option>
                    ))}
                  </select>                
                </div>
              </div>
            )}
          {loading ? (
            <Spinner size={48} />
          ) : filteredProjects.length === 0 ? (
            <p>Inga projekt än</p>
          ) : (
            <ul className="projects-list">
              {filteredProjects.map((p) => (
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