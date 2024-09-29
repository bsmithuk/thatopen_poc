import { Project } from "./class/Project";

function showModal(id) {
    const modal = document.getElementById(id)
    if (modal) {
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

let projectData = [];

const projectForm = document.getElementById("new-project-form")

if (projectForm) {
    projectForm.addEventListener("submit", (e) => {
        e.preventDefault()
        const formData = new FormData(projectForm)
        const projectData= {
            name: formData.get("name"),
            description: formData.get("description"),
            userRole: formData.get("userRole"),
            status: formData.get("status"),
            finishDate: formData.get("finishDate"),
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