export interface UserSummary {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface CommentWithUser {
  id: string;
  body: string;
  createdAt: string;
  user: UserSummary;
}

export interface TaskWithRelations {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  labels: string[];
  order: number;
  columnId: string;
  completedAt: string | null;
  assignee: UserSummary | null;
  creator: UserSummary | null;
  comments: CommentWithUser[];
  createdAt?: string;
}

export interface ColumnWithTasks {
  id: string;
  name: string;
  order: number;
  boardId: string;
  tasks: TaskWithRelations[];
}

export interface BoardWithColumns {
  id: string;
  name: string;
  workspaceId: string;
  columns: ColumnWithTasks[];
}
