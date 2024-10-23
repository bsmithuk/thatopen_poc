import { IProject, Project, ProjectStatus, UserRole } from "./Project";
import { Todo, TodoStatus } from "./ToDo";

interface ImportedProject extends IProject {
  todos?: {
    description: string;
    dueDate: string;
    completed: boolean;
    status: TodoStatus;
  }[];
  progress: number;  
  cost: number;
}

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
        <div class="todo-item" style="background-color: ${todo.getStatusColor()};">
          <div class="todo-content">
            <div class="todo-left">
              <span class="material-icons-round todo-checkbox">
                ${todo.completed ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <div class="todo-info">
                <p class="todo-description">${todo.description}</p>
                <span class="todo-status-badge">
                  ${todo.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            <div class="todo-right">
              <p class="todo-date">
                ${todo.dueDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
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
  addTodo(projectId: string, description: string, dueDate: Date, status: TodoStatus = TodoStatus.TODO) {
    const project = this.getProject(projectId);
    if (project) {
      const newTodo = project.addTodo(description, dueDate, status);
      this.refreshProjectDetails(projectId);
      return newTodo;
    } else {
      throw new Error("Project not found");
    }
  }
  
  updateTodo(projectId: string, todoId: string, description: string, dueDate: Date, status: TodoStatus) {
    const project = this.getProject(projectId);
    if (project) {
      project.updateTodo(todoId, description, dueDate, status);
      this.refreshProjectDetails(projectId);
    }
  }

  removeTodo(projectId: string, todoId: string) {
    const project = this.getProject(projectId);
    if (project) {
      project.removeTodo(todoId);
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
      cost: project.cost,
      todos: project.todos.map(todo => ({
        description: todo.description,
        dueDate: todo.dueDate,
        completed: todo.completed,
        status: todo.status  
      }))
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
            const projects: ImportedProject[] = JSON.parse(e.target?.result as string);
            
            projects.forEach(projectData => {
              try {
                // Check if project already exists
                const existingProject = this.list.find(p => p.name === projectData.name);

                if (existingProject) {
                  // Update existing project
                  this.updateExistingProject(existingProject, projectData);
                } else {
                  // Create new project
                  this.createNewProjectFromImport(projectData);
                }
              } catch (error) {
                console.error(`Failed to import project: ${projectData.name}`, error);
              }
            });

            // Refresh the UI after all imports are complete
            this.refreshProjectsList();
            
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

  private updateExistingProject(existingProject: Project, importedData: ImportedProject) {
    // Confirm with user before updating
    if (confirm(`Project "${importedData.name}" already exists. Would you like to update it with the imported data?`)) {
      // Update basic project properties
      existingProject.description = importedData.description;
      existingProject.status = importedData.status;
      existingProject.userRole = importedData.userRole;
      existingProject.finishDate = new Date(importedData.finishDate);
      existingProject.progress = importedData.progress;
      existingProject.cost = importedData.cost;

      // Handle todos
      if (importedData.todos) {
        // Clear existing todos if user confirms
        if (existingProject.todos.length > 0) {
          if (confirm(`Would you like to replace existing todos in project "${importedData.name}"?`)) {
            existingProject.todos = []; // Clear existing todos
          } else {
            // Skip todo import if user doesn't want to replace
            return;
          }
        }

        // Import new todos
        importedData.todos.forEach(todoData => {
          const todo = existingProject.addTodo(
            todoData.description,
            new Date(todoData.dueDate)
          );
          if (todoData.completed) {
            todo.toggle();
          }
        });
      }

      // Update UI
      existingProject.setUI();
      this.refreshProjectDetails(existingProject.id);
    }
  }

  private createNewProjectFromImport(projectData: ImportedProject) {
    const project = this.newProject({
      name: projectData.name,
      description: projectData.description,
      status: projectData.status,
      userRole: projectData.userRole,
      finishDate: new Date(projectData.finishDate)
    });

    // Set additional properties
    project.progress = projectData.progress;
    project.cost = projectData.cost;

    // Import todos if they exist
    if (projectData.todos) {
      projectData.todos.forEach(todoData => {
        const todo = project.addTodo(
          todoData.description,
          new Date(todoData.dueDate),
          todoData.status || TodoStatus.TODO  // Add status with default
        );
        if (todoData.completed) {
          todo.completed = true;  // Set completed directly instead of using toggle()
        }
      });
    }

    return project;
  }
}