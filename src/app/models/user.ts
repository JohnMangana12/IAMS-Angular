export interface User {
  id?: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
  agile_train?: string;
  scrum_team?: string;
  status?: string;
  password?: string;
  created_at?: string;
  updated_at?: string;

  // *** NEW FIELD ***
  requiresPasswordChange?: boolean;
}
