import { IProject, Project, ProjectStatus, UserRole } from "./Project";
import { Todo } from "./ToDo";

export class ProjectsManager {
  private list: Project[] = [];
  private ui: HTMLElement;

  constructor(container: HTMLElement) {
    this.ui = container;
    this.initializeDefaultProject();
  }

  private initializeDefaultProject() {
    this.newProject({
      name: "Default Project",
      description: "This is just a default app project",
      status: "pending",
      userRole: "architect",
      finishDate: new Date(),
    });
  }

  newProject(data: IProject): Project {
    this.validateProjectData(data);
    const project = new Project(data);
    project.ui.addEventListener("click", () => this.handleProjectClick(project));
    this.ui.append(project.ui);
    this.list.push(project);
    return project;
  }

  private validateProjectData(data: IProject) {
    if (this.list.some(project => project.name === data.name)) {
      throw new Error(`A project with the name "${data.name}" already exists`);
    }
    if (data.name.length < 3) {
      throw new Error("Project name must be at least 3 characters long");
    }
  }

  private handleProjectClick(project: Project) {
    const projectsPage = document.getElementById("projects-page");
    const detailsPage = document.getElementById("project-details");
    if (projectsPage && detailsPage) {
      projectsPage.style.display = "none";
      detailsPage.style.display = "flex";
      this.setDetailsPage(project);
    }
  }

  setDetailsPage(project: Project) {
    const detailPage = document.getElementById("project-details");
    if (!detailPage) return;

    detailPage.setAttribute("data-current-project-id", project.id);

    const updateElement = (selector: string, value: string) => {
      const elements = detailPage.querySelectorAll(selector);
      elements.forEach(element => {
        if (element) element.textContent = value;
      });
    };

    updateElement('[data-project-info="name"]', project.name);
    updateElement('[data-project-info="description"]', project.description);
    updateElement('[data-project-info="status"]', project.status);
    updateElement('[data-project-info="userRole"]', project.userRole);
    updateElement('[data-project-info="finishDate"]', project.finishDate.toLocaleDateString("en-UK"));
    
    const progressElement = detailPage.querySelector('[data-project-info="progress"]') as HTMLElement;
    if (progressElement) {
      const progressValue = project.progress;
      progressElement.textContent = `${progressValue}%`;
      progressElement.style.width = `${progressValue}%`;
      progressElement.style.backgroundColor = this.getProgressColor(progressValue);
    }

    const codeElement = detailPage.querySelector('[data-project-info="code"]') as HTMLElement;
    if (codeElement) {
      codeElement.textContent = project.code;
      codeElement.style.backgroundColor = project.getColour();
    }

    this.updateTodoList(project, detailPage);
  }

  private updateTodoList(project: Project, detailPage: HTMLElement) {
    const todoListElement = detailPage.querySelector('#todo-list');
    if (todoListElement) {
      todoListElement.innerHTML = project.todos.map(todo => `
        <div class="todo-item">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; column-gap: 15px; align-items: center;">
              <span class="material-icons-round" style="padding: 10px; background-color: #686868; border-radius: 10px;">
                ${todo.completed ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <p>${todo.description}</p>
            </div>
            <p style="text-wrap: nowrap; margin-left: 10px;">${todo.dueDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
      `).join('');
    }
  }

  private getProgressColor(progress: number): string {
    if (progress === 100) return 'green';
    if (progress > 30) return 'orange';
    return 'red';
  }

  getProject(id: string): Project | undefined {
    return this.list.find(project => project.id === id);
  }

  updateProject(id: string, data: Partial<IProject>) {
    const project = this.getProject(id);
    if (!project) {
      throw new Error(`Project with id "${id}" not found`);
    }
    Object.assign(project, data);
    project.setUI(); // Update the project's UI
    this.setDetailsPage(project);
    this.refreshProjectsList(); // Refresh the entire projects list
  }

  refreshProjectDetails(id: string) {
    const project = this.getProject(id);
    if (project) {
      this.setDetailsPage(project);
      this.refreshProjectsList(); // Refresh the projects list
    }
  }
  

  refreshProjectsList() {
    this.ui.innerHTML = ''; // Clear the current list
    this.list.forEach(project => {
      project.setUI(); // Refresh the UI for each project
      this.ui.appendChild(project.ui);
    });
  }


  private updateProjectCard(project: Project) {
    const projectCard = this.ui.querySelector(`[data-project-id="${project.id}"]`);
    if (projectCard instanceof HTMLElement) {
      const updateElement = (selector: string, value: string) => {
        const element = projectCard.querySelector(selector);
        if (element instanceof HTMLElement) element.textContent = value;
      };

      updateElement('[data-project-name]', project.name);
      updateElement('[data-project-description]', project.description);
      updateElement('[data-project-status]', project.status);
      updateElement('[data-project-role]', project.userRole);
    }
  }

  deleteProject(id: string) {
    const project = this.getProject(id);
    if (project) {
      project.ui.remove();
      this.list = this.list.filter(p => p.id !== id);
    }
  }

  //ToDo list functionality
  addTodo(projectId: string, description: string, dueDate: Date) {
    const project = this.getProject(projectId);
    if (project) {
      const newTodo = project.addTodo(description, dueDate);
      this.refreshProjectDetails(projectId); // This line refreshes the project details, including the todo list
      return newTodo;
    } else {
      throw new Error("Project not found");
    }
  }
  removeTodo(projectId: string, todoId: string) {
    const project = this.getProject(projectId);
    if (project) {
      project.removeTodo(todoId);
      this.refreshProjectDetails(projectId);
    }
  }

  updateTodo(projectId: string, todoId: string, description: string, dueDate: Date) {
    const project = this.getProject(projectId);
    if (project) {
      project.updateTodo(todoId, description, dueDate);
      this.refreshProjectDetails(projectId);
    }
  }

  toggleTodo(projectId: string, todoId: string) {
    const project = this.getProject(projectId);
    if (project) {
      project.toggleTodo(todoId);
      this.refreshProjectDetails(projectId);
    } else {
      throw new Error("Project not found");
    }
  }

  //Import/Export JSON
  exportToJSON(fileName: string = "projects") {
    const data = this.list.map(project => ({
      name: project.name,
      description: project.description,
      status: project.status,
      userRole: project.userRole,
      finishDate: project.finishDate,
      progress: project.progress,
      cost: project.cost
    }));
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importFromJSON() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.addEventListener("change", (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const projects: IProject[] = JSON.parse(e.target?.result as string);
            projects.forEach(project => {
              try {
                this.newProject({
                  ...project,
                  finishDate: new Date(project.finishDate)
                });
              } catch (error) {
                console.error(`Failed to import project: ${project.name}`, error);
              }
            });
          } catch (error) {
            console.error("Failed to parse JSON", error);
            alert("Failed to import projects. Invalid file format.");
          }
        };
        reader.readAsText(file);
      }
    });
    input.click();
  }
}