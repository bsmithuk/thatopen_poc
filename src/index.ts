import { IProject, Project, ProjectStatus, UserRole } from "./classes/Project";
import { ProjectsManager } from "./classes/ProjectsManager";
import { PageNavigator } from "./classes/PageNavigator";
import { Todo } from "./classes/ToDo";

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
  const closeNewProjectBtn = document.getElementById("cancel-project-btn");
  if (closeNewProjectBtn) {
    closeNewProjectBtn.addEventListener("click", () => newProjectModal.close());
  }
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
        
        // Refresh both the project details and the projects list
        projectsManager.refreshProjectDetails(currentProject.id);
        projectsManager.refreshProjectsList();

        // Navigate back to the projects page
        const projectsPage = document.getElementById("projects-page");
        const projectDetailsPage = document.getElementById("project-details");
        if (projectsPage && projectDetailsPage) {
          projectsPage.style.display = "none";
          projectDetailsPage.style.display = "flex";
        }
      } catch (error) {
        console.error("Failed to update project:", error);
        alert(error instanceof Error ? error.message : "Failed to update project. Please try again.");
      }
    } else {
      console.error("No current project found");
      alert("No project selected for editing.");
    }
  });
}

// Add Todo functionality
const addTodoBtn = document.getElementById("add-todo-btn");
const addTodoModal = document.getElementById("add-todo-modal") as HTMLDialogElement;
const addTodoForm = document.getElementById("add-todo-form") as HTMLFormElement;

if (addTodoBtn && addTodoModal && addTodoForm) {
  addTodoBtn.addEventListener("click", () => addTodoModal.showModal());

  addTodoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(addTodoForm);
    const description = formData.get("description") as string;
    const dueDate = new Date(formData.get("dueDate") as string);
    
    const currentProjectId = document.getElementById("project-details")?.getAttribute("data-current-project-id");
    
    if (currentProjectId) {
      try {
        projectsManager.addTodo(currentProjectId, description, dueDate);
        addTodoForm.reset();
        addTodoModal.close();
        
        // Refresh the project details to show the new todo
        projectsManager.refreshProjectDetails(currentProjectId);
      } catch (err) {
        console.error("Failed to add Todo:", err);
        alert(err);
      }
    } else {
      alert("No project selected");
    }
  });
}


// Add event listener for toggling todos
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.closest('.todo-item')) {
    const todoItem = target.closest('.todo-item') as HTMLElement;
    const todoIndex = Array.from(todoItem.parentElement?.children || []).indexOf(todoItem);
    const projectId = document.getElementById("project-details")?.getAttribute("data-current-project-id");
    if (projectId) {
      const project = projectsManager.getProject(projectId);
      if (project && project.todos[todoIndex]) {
        projectsManager.toggleTodo(projectId, project.todos[todoIndex].id);
      }
    }
  }
});

// Add search functionality
const todoSearch = document.getElementById('todo-search') as HTMLInputElement;
if (todoSearch) {
  todoSearch.addEventListener('input', (e) => {
    const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
    const todoItems = document.querySelectorAll('.todo-item');
    todoItems.forEach((item) => {
      const text = item.textContent?.toLowerCase() || '';
      if (text.includes(searchTerm)) {
        (item as HTMLElement).style.display = '';
      } else {
        (item as HTMLElement).style.display = 'none';
      }
    });
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
    projectsNavBtn.addEventListener("click", () => {
      navigator.navigateTo("projects-page");
      projectsManager.refreshProjectsList();
    });
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
