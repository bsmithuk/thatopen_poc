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
  status: TodoStatus;

  constructor(description: string, dueDate: Date, status: TodoStatus = TodoStatus.TODO) {
    this.id = uuidv4();
    this.description = description;
    this.dueDate = dueDate;
    this.completed = false;
    this.status = status;
  }

  toggle() {
    this.completed = !this.completed;
    if (this.completed) {
      this.status = TodoStatus.COMPLETED;
    } else {
      this.status = TodoStatus.TODO;
    }
  }

  update(description: string, dueDate: Date, status: TodoStatus) {
    this.description = description;
    this.dueDate = dueDate;
    this.status = status;
    this.completed = status === TodoStatus.COMPLETED;
  }

  getStatusColor(): string {
    switch (this.status) {
      case TodoStatus.TODO:
        return 'var(--background-200)';
      case TodoStatus.IN_PROGRESS:
        return '#2C3E50';
      case TodoStatus.BLOCKED:
        return '#922B21';
      case TodoStatus.COMPLETED:
        return '#196F3D';
      default:
        return 'var(--background-200)';
    }
  }
}

