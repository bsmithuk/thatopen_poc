import { IProject, ProjectStatus, UserRole } from "./classes/Project";
import { ProjectsManager } from "./classes/ProjectsManager";
import { PageNavigator } from "./classes/PageNavigator";

function showModal(id: string) {
  const modal = document.getElementById(id);
  if (modal && modal instanceof HTMLDialogElement) {
    modal.showModal();
  } else {
    console.warn("The provided modal wasn't found. ID: ", id);
  }
}

function closeModal(id: string) {
  const modal = document.getElementById(id);
  if (modal && modal instanceof HTMLDialogElement) {
    modal.close();
  } else {
    console.warn("The provided modal wasn't found. ID: ", id);
  }
}

function toggleModal() {
  const modal = document.getElementById(
    "new-project-modal"
  ) as HTMLDialogElement;
  if (modal) {
    if (modal.open) {
      modal.close();
    } else {
      modal.showModal();
    }
  }
}

const projectsListUI = document.getElementById("projects-list") as HTMLElement;
const projectsManager = new ProjectsManager(projectsListUI);

// This document object is provided by the browser, and its main purpose is to help us interact with the DOM.
const newProjectBtn = document.getElementById("new-project-btn");
if (newProjectBtn) {
  newProjectBtn.addEventListener("click", () => {
    showModal("new-project-modal");
  });
} else {
  console.warn("New projects button was not found");
}

const projectForm = document.getElementById("new-project-form");
if (projectForm && projectForm instanceof HTMLFormElement) {
  projectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(projectForm);
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      finishDate: new Date(formData.get("finishDate") as string),
    };
    try {
      const project = projectsManager.newProject(projectData);
      projectForm.reset();
      closeModal("new-project-modal");
    } catch (err) {
      alert(err);
    }
  });
} else {
  console.warn("The project form was not found. Check the ID!");
}

// Close modal when cancel button is clicked
document
  .querySelector("button[type='button']")
  ?.addEventListener("click", () => {
    toggleModal();
  });

const exportProjectsBtn = document.getElementById("export-projects-btn");
if (exportProjectsBtn) {
  exportProjectsBtn.addEventListener("click", () => {
    projectsManager.exportToJSON();
  });
}

const importProjectsBtn = document.getElementById("import-projects-btn")
if (importProjectsBtn) {
  importProjectsBtn.addEventListener("click", () => {
    projectsManager.importFromJSON()
  })
}


// Initialize the PageNavigator
document.addEventListener('DOMContentLoaded', () => {
  const navigator = new PageNavigator();

  // Event for projects navigation button
  const projectsNavBtn = document.getElementById("projects-nav-btn");
  if (projectsNavBtn) {
    projectsNavBtn.addEventListener("click", () => {
      navigator.navigateTo("projects-page");
    });
  }

  // Event for users navigation button
  const usersNavBtn = document.getElementById("users-nav-btn");
  if (usersNavBtn) {
    usersNavBtn.addEventListener("click", () => {
      navigator.navigateTo("users-page");
    });
  }
});