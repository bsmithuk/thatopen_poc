import { v4 as uuidv4 } from "uuid";

export type ProjectStatus = "pending" | "active" | "finished";
export type UserRole = "architect" | "engineer" | "developer";

export interface IProject {
  name: string;
  description: string;
  status: ProjectStatus;
  userRole: UserRole;
  finishDate: Date;
}

export class Project implements IProject {
  //To satisfy IProject
  name: string;
  code: string;
  description: string;
  status: "pending" | "active" | "finished";
  userRole: "architect" | "engineer" | "developer";
  finishDate: Date;
  //Class internals
  ui: HTMLDivElement;
  cost: number = 0;
  progress: number = 0;
  id: string;
  // Colour property to store the generated color
  private colour: string;

  constructor(data: IProject) {
    // Project data definition
    this.id = uuidv4();
    this.name = data.name;
    this.code = data.name.slice(0, 2).toUpperCase();
    this.description = data.description;
    this.status = data.status;
    this.userRole = data.userRole;
    this.finishDate =
      data.finishDate instanceof Date
        ? data.finishDate
        : new Date(data.finishDate);
    this.cost = 0;
    this.progress = 0;
    this.colour = this.getRandomColour();    
    this.setUI();
  }

  private getRandomColour(): string {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  //Pull UI into 'Project'
  setUI() {
    if (!this.ui) {
      this.ui = document.createElement("div");
    }
    this.ui.className = "project-card";
    this.ui.setAttribute("data-project-id", this.id);
    this.ui.innerHTML = `
    <div class="card-header">
      <p style="background-color: ${this.colour}; padding: 10px; border-radius: 14px; aspect-ratio: 1;">${this.code}</p>
      <div>
        <h5 data-project-name>${this.name}</h5>
        <p data-project-description>${this.description}</p>
      </div>
    </div>
    <div class="card-content">
      <div class="card-property">
        <p style="color: #969696;">Status</p>
        <p data-project-status>${this.status}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Role</p>
        <p data-project-role>${this.userRole}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Cost</p>
        <p>£${this.cost}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Estimated Progress</p>
        <p>${this.progress * 100}%</p>
      </div>
    </div>`;
  }

  public getColour(): string {
    return this.colour;
  }
}
