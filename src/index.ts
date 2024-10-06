import { IProject, Project, ProjectStatus, UserRole } from "./classes/Project";
import { ProjectsManager } from "./classes/ProjectsManager";
import { PageNavigator } from "./classes/PageNavigator";

const projectsListUI = document.getElementById("projects-list") as HTMLElement;
const projectsManager = new ProjectsManager(projectsListUI);

// New Project Button
const newProjectBtn = document.getElementById("new-project-btn");
const newProjectModal = document.getElementById("new-project-modal") as HTMLDialogElement;
const projectForm = document.getElementById("new-project-form") as HTMLFormElement;

if (newProjectBtn && newProjectModal && projectForm) {
  newProjectBtn.addEventListener("click", () => newProjectModal.showModal());

  projectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(projectForm);
    const finishDateStr = formData.get("finishDate") as string;
    const finishDate = finishDateStr ? new Date(finishDateStr) : getDefaultFinishDate();
    
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      finishDate: finishDate,
    };

    try {
      projectsManager.newProject(projectData);
      projectForm.reset();
      newProjectModal.close();
    } catch (err) {
      console.error("Failed to create new project:", err);
      alert(err);
    }
  });
} else {
  console.warn("New project elements not found. Check your HTML.");
}

// Edit Project
const editProjectBtn = document.getElementById("edit-project-btn");
const editProjectModal = document.getElementById("edit-project-modal") as HTMLDialogElement;
const editProjectForm = document.getElementById("edit-project-form") as HTMLFormElement;
const cancelEditBtn = document.getElementById("cancel-edit-btn");

if (editProjectBtn && editProjectModal && editProjectForm && cancelEditBtn) {
  editProjectBtn.addEventListener("click", () => {
    const currentProject = getCurrentProject();
    if (currentProject) {
      (editProjectForm.elements.namedItem("name") as HTMLInputElement).value = currentProject.name;
      (editProjectForm.elements.namedItem("description") as HTMLTextAreaElement).value = currentProject.description;
      (editProjectForm.elements.namedItem("userRole") as HTMLSelectElement).value = currentProject.userRole;
      (editProjectForm.elements.namedItem("status") as HTMLSelectElement).value = currentProject.status;
      (editProjectForm.elements.namedItem("finishDate") as HTMLInputElement).value = currentProject.finishDate.toISOString().split('T')[0];
      editProjectModal.showModal();
    } else {
      console.error("No current project found");
      alert("No project selected for editing.");
    }
  });

  cancelEditBtn.addEventListener("click", () => editProjectModal.close());

  editProjectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(editProjectForm);
    const projectData: Partial<IProject> = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      finishDate: new Date(formData.get("finishDate") as string),
    };
    const currentProject = getCurrentProject();
    if (currentProject) {
      try {
        projectsManager.updateProject(currentProject.id, projectData);
        editProjectModal.close();
        // Refresh the project details view
        projectsManager.refreshProjectDetails(currentProject.id);
      } catch (error) {
        console.error("Failed to update project:", error);
        alert("Failed to update project. Please try again.");
      }
    } else {
      console.error("No current project found");
      alert("No project selected for editing.");
    }
  });
}

// Export/Import 
const exportProjectsBtn = document.getElementById("export-projects-btn");
if (exportProjectsBtn) {
  exportProjectsBtn.addEventListener("click", () => projectsManager.exportToJSON());
}

const importProjectsBtn = document.getElementById("import-projects-btn")
if (importProjectsBtn) {
  importProjectsBtn.addEventListener("click", () => projectsManager.importFromJSON());
}

// PageNavigator 
document.addEventListener('DOMContentLoaded', () => {
  const navigator = new PageNavigator();
  const projectsNavBtn = document.getElementById("projects-nav-btn");
  const usersNavBtn = document.getElementById("users-nav-btn");

  if (projectsNavBtn) {
    projectsNavBtn.addEventListener("click", () => navigator.navigateTo("projects-page"));
  }
  if (usersNavBtn) {
    usersNavBtn.addEventListener("click", () => navigator.navigateTo("users-page"));
  }
});

// Helper Functions
function getDefaultFinishDate(): Date {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date;
}

function getCurrentProject(): Project | null {
  const projectDetailsPage = document.getElementById("project-details");
  if (projectDetailsPage) {
    const projectId = projectDetailsPage.getAttribute("data-current-project-id");
    return projectId ? projectsManager.getProject(projectId) || null : null;
  }
  return null;
}