export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoList {
  id: string;
  name: string;
  items: TodoItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteList {
  id: string;
  name: string;
  notes: Note[];
  createdAt: Date;
  updatedAt: Date;
} 