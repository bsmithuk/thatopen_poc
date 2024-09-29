import { Project, IProject, ProjectStatus,UserRole } from "./class/Project";

function showModal(id: string) {
    const modal = document.getElementById(id)
    if (modal && modal instanceof HTMLDialogElement) {
      modal.showModal()
    } else {
      console.warn("The provided modal wasn't found. ID: ", id)
    }
  }

// This document object is provided by the browser, and its main purpose is to help us interact with the DOM.
const newProjectButton = document.getElementById('new-project-button');

if (newProjectButton) {
    newProjectButton.addEventListener("click", () => {
        showModal("new-project-modal")
    });
} else {
    console.warn("New project button was not found");
}

const projectForm = document.getElementById("new-project-form")

if (projectForm && projectForm instanceof HTMLFormElement) {
    projectForm.addEventListener("submit", (e) => {
        e.preventDefault()
        const formData = new FormData(projectForm)
        const projectData: IProject= {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            status: formData.get("status") as ProjectStatus,
            userRole: formData.get("userRole") as UserRole,
            finishDate: new Date(formData.get("finishDate") as string),
        }

        const project = new Project(projectData)
        console.log("New Project Submitted: ", project);
    });
} else {
    console.warn("The project form was not found. Check the ID!");
}


// const newProjectButton = document.getElementById('new-project-button');
// const newProjectModal = document.getElementById('new-project-modal');
// const cancelButton = document.getElementById('cancel-button');
// const projectDetailsPage = document.getElementById('project-details');
// const projectsPage = document.getElementById('projects-page');

// newProjectButton.onclick = () => {
//   newProjectModal.showModal();
// };

// cancelButton.onclick = () => {
//   newProjectModal.close();
// };

// function showProjectDetails() {
//   projectsPage.style.display = 'none';
//   projectDetailsPage.style.display = 'flex';
// }