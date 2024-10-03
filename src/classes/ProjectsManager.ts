import { IProject, Project } from "./Project";

export class ProjectsManager {
  list: Project[] = [];
  ui: HTMLElement;

  constructor(container: HTMLElement) {
    this.ui = container;
    this.newProject({
      name: "Default Project",
      description: "This is just a default app project",
      status: "pending",
      userRole: "architect",
      finishDate: new Date(),
    });
  }

  newProject(data: IProject) {
    // Check for duplicate project names
    const projectNames = this.list.map((project) => project.name);
    const nameInUse = projectNames.includes(data.name);
    
    if (nameInUse) {
      throw new Error(`A project with the name "${data.name}" already exists`);
    }
    // Create new project
    const project = new Project(data);
    project.ui.addEventListener("click",() =>{
    // Get the projects and details page elements
    const projectsPage = document.getElementById("projects-page");
    const detailsPage = document.getElementById("project-details");
    if (!(projectsPage && detailsPage)) { return }
      projectsPage.style.display = "none";
      detailsPage.style.display = "flex";
  })
    // Add the project to the UI and the list
    this.ui.append(project.ui);
    this.list.push(project);
    return project;
  }

  getProject(id: string) {
    const project = this.list.find((project) => {
      return project.id === id;
    });
    return project;
  }

  deleteProject(id: string) {
    const project = this.getProject(id);
    if (!project) {
      return;
    }
    project.ui.remove();
    const remaining = this.list.filter((project) => {
      return project.id !== id;
    });
    this.list = remaining;
  }

  exportToJSON(fileName: string = "projects") {
    function replacer(key, value) {  // Replacer function to filter out specific properties
        if (key === "ui") {
            return undefined;
        }
        return value;
    }
    const json = JSON.stringify(this.list, replacer, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');  // Create a temporary anchor element to trigger the download
    a.href = url;
    a.download = `${fileName}.json`;
    a.click();
    URL.revokeObjectURL(url); // Revoke the URL to free up memory
}
 
  importFromJSON() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      const json = reader.result
      if (!json) { return }
      const projects: IProject[] = JSON.parse(json as string)
      for (const project of projects) {
        try {
          this.newProject(project)
        } catch (error) {
          
        }
      }
    })
    input.addEventListener('change', () => {
      const filesList = input.files
      if (!filesList) { return }
      reader.readAsText(filesList[0])
    })
    input.click()
  }
}