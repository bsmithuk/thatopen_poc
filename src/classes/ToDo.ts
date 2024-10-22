import { v4 as uuidv4 } from "uuid";

export enum TodoStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  BLOCKED = "blocked",
  COMPLETED = "completed"
}

export class Todo {
  id: string;
  description: string;
  dueDate: Date;
  completed: boolean;

  constructor(description: string, dueDate: Date) {
    this.id = uuidv4();
    this.description = description;
    this.dueDate = dueDate;
    this.completed = false;
  }

  toggle() {
    this.completed = !this.completed;
  }

  update(description: string, dueDate: Date) {
    this.description = description;
    this.dueDate = dueDate;
  }
}