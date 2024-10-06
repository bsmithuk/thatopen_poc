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
    // Check for project name minimum length
    if (data.name.length < 3) {
      throw new Error("Project name must be at least 3 characters long");
    }
    // Create new project
    const project = new Project(data);
    project.ui.addEventListener("click", () => {
      // Get the projects and details page elements
      const projectsPage = document.getElementById("projects-page");
      const detailsPage = document.getElementById("project-details");
      if (!(projectsPage && detailsPage)) {
        return;
      }
      projectsPage.style.display = "none";
      detailsPage.style.display = "flex";
      this.setDetailsPage(project);
    });
    // Add the project to the UI and the list
    this.ui.append(project.ui);
    this.list.push(project);
    return project;
  }

  private setDetailsPage(project: Project) {
    const detailPage = document.getElementById("project-details");
    if (!detailPage) {
      return;
    }
    for (const key in project) {
      // Select all elements matching the data attribute
      const dataElements = detailPage.querySelectorAll(
        `[data-project-info="${key}"]`
      );

      // Only proceed if there are matching elements
      if (dataElements.length > 0) {
        if (key === "progress") {
          const progressValue = project.progress;  
          // Update both text and width for each 'progress' element
          dataElements.forEach((element) => {
            const progressElement = element as HTMLElement; // Cast to HTMLElement
              progressElement.textContent = `${progressValue}%`;
              progressElement.style.width = `${progressValue}%`;
            // Set a background color (e.g., green when progress is full)
            if (progressValue === 100) {
              progressElement.style.backgroundColor = 'green';
            } else if (progressValue > 30) {
              progressElement.style.backgroundColor = 'orange';
            } else {
              progressElement.style.backgroundColor = 'red';
            }
          });
        } 
        else if (key === "finishDate") {
          // Format the finish date
          const formattedDate = project.finishDate.toLocaleDateString("en-UK", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          });

          // Update all elements for finishDate
          dataElements.forEach((element) => {
            element.textContent = formattedDate;
          });
        } else {
          // Update text content for other properties
          dataElements.forEach((element) => {
            element.textContent = project[key]?.toString() || ""; // Convert to string or default to empty
          });
        }
      }
    }
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
    function replacer(key, value) {
      // Replacer function to filter out specific properties
      if (key === "ui") {
        return undefined;
      }
      return value;
    }
    const json = JSON.stringify(this.list, replacer, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); // Create a temporary anchor element to trigger the download
    a.href = url;
    a.download = `${fileName}.json`;
    a.click();
    URL.revokeObjectURL(url); // Revoke the URL to free up memory
  }

  importFromJSON() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const json = reader.result;
      if (!json) {
        return;
      }
      const projects: IProject[] = JSON.parse(json as string);
      for (const project of projects) {
        try {
          this.newProject(project);
        } catch (error) {}
      }
    });
    input.addEventListener("change", () => {
      const filesList = input.files;
      if (!filesList) {
        return;
      }
      reader.readAsText(filesList[0]);
    });
    input.click();
  }
}
