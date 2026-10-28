export interface ActionState {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}
