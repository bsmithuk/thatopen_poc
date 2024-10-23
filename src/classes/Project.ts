import { v4 as uuidv4 } from "uuid";
import { Todo, TodoStatus } from "./ToDo";

export type ProjectStatus = "pending" | "active" | "finished";
export type UserRole = "architect" | "engineer" | "developer";

export interface IProject {
  name: string;
  description: string;
  status: ProjectStatus;
  userRole: UserRole;
  finishDate: Date;
  progress?: number;  // Added as optional
  cost?: number;      // Added as optional
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
  todos: Todo[] = [];
  private colour: string;   // Colour property to store the generated color

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

  addTodo(description: string, dueDate: Date, status: TodoStatus = TodoStatus.TODO): Todo {
    const newTodo = new Todo(description, dueDate, status);
    this.todos.push(newTodo);
    return newTodo;
  }

  removeTodo(id: string) {
    this.todos = this.todos.filter(todo => todo.id !== id);
  }

  updateTodo(id: string, description: string, dueDate: Date, status: TodoStatus) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
        todo.update(description, dueDate, status);
    }
  }

  toggleTodo(id: string) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.toggle();
    }
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

  updateTodoList() {
    const todoList = this.ui.querySelector('#todo-list');
    if (todoList) {
      todoList.innerHTML = this.todos.map(todo => `
        <div class="todo-item" style="background-color: ${todo.getStatusColor()};">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; column-gap: 15px; align-items: center;">
              <span class="material-icons-round" style="padding: 10px; background-color: rgba(104, 104, 104, 0.3); border-radius: 10px;">
                ${todo.completed ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <div>
                <p>${todo.description}</p>
                <p style="font-size: var(--font-xs); color: rgba(255,255,255,0.6); margin-top: 4px;">
                  ${todo.status.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>
            <p style="text-wrap: nowrap; margin-left: 10px;">
              ${todo.dueDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      `).join('');
    }
  }

  public getColour(): string {
    return this.colour;
  }
}
