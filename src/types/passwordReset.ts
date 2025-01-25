export interface FormState {
  email: string;
  secretAnswer: string;
  newPassword: string;
  secretQuestion: string | null;
  isLoading: boolean;
  error: string | null;
}

export type FormFieldName = 'email' | 'secretAnswer' | 'newPassword';