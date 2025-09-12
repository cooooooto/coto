export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          deadline: string;
          status: 'To-Do' | 'In-Progress' | 'Done';
          phase: 'DEV' | 'INT' | 'PRE' | 'PROD';
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          deadline: string;
          status: 'To-Do' | 'In-Progress' | 'Done';
          phase: 'DEV' | 'INT' | 'PRE' | 'PROD';
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          deadline?: string;
          status?: 'To-Do' | 'In-Progress' | 'Done';
          phase?: 'DEV' | 'INT' | 'PRE' | 'PROD';
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          completed?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
