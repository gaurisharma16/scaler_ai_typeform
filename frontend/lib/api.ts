import type { FormDetail, FormListItem, FormStats, LogicRule, PublicForm, Question, QuestionType, ResponseDetail, ResponseListItem } from "./types";
const BASE_URL = "";
class ApiError extends Error { status: number; constructor(status: number, message: string) { super(message); this.status = status; } }
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(options?.headers || {}) }, cache: "no-store" });
  if (!res.ok) { let detail = res.statusText; try { const body = await res.json(); detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail); } catch {} throw new ApiError(res.status, detail); }
  if (res.status === 204) return undefined as T;
  return res.json();
}
export const listForms = () => request<FormListItem[]>("/api/forms");
export const getForm = (id: number) => request<FormDetail>(`/api/forms/${id}`);
export const createForm = (title: string) => request<FormDetail>("/api/forms", { method: "POST", body: JSON.stringify({ title }) });
export const updateForm = (id: number, data: Partial<{ title: string; thank_you_message: string; theme: object; theme_color: string; welcome_title: string; welcome_desc: string; thankyou_title: string; thankyou_desc: string }>) => request<FormDetail>(`/api/forms/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteForm = (id: number) => request<void>(`/api/forms/${id}`, { method: "DELETE" });
export const duplicateForm = (id: number) => request<FormDetail>(`/api/forms/${id}/duplicate`, { method: "POST" });
export const publishForm = (id: number) => request<FormDetail>(`/api/forms/${id}/publish`, { method: "POST" });
export const unpublishForm = (id: number) => request<FormDetail>(`/api/forms/${id}/unpublish`, { method: "POST" });
export interface QuestionInput { type: QuestionType; title: string; description?: string | null; required?: boolean; settings?: Record<string, unknown>; options?: string[]; }
export const createQuestion = (formId: number, data: QuestionInput) => request<Question>(`/api/forms/${formId}/questions`, { method: "POST", body: JSON.stringify(data) });
export const updateQuestion = (questionId: number, data: Partial<QuestionInput>) => request<Question>(`/api/questions/${questionId}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteQuestion = (questionId: number) => request<void>(`/api/questions/${questionId}`, { method: "DELETE" });
export const reorderQuestions = (formId: number, questionIds: number[]) => request<void>(`/api/forms/${formId}/questions/reorder`, { method: "POST", body: JSON.stringify({ question_ids: questionIds }) });
export const updateQuestionPosition = (questionId: number, canvas_x: number, canvas_y: number) => request<Question>(`/api/questions/${questionId}/position`, { method: "PATCH", body: JSON.stringify({ canvas_x, canvas_y }) });
export const getLogic = (formId: number) => request<LogicRule[]>(`/api/forms/${formId}/logic`);
export const getPublicForm = (slug: string) => request<PublicForm>(`/api/public/forms/${slug}`);
export const startResponse = (slug: string) => request<{ response_id: number }>(`/api/public/forms/${slug}/responses/start`, { method: "POST" });
export const saveAnswer = (responseId: number, questionId: number, value: unknown) => request<void>(`/api/public/responses/${responseId}/answers`, { method: "PATCH", body: JSON.stringify({ question_id: questionId, value }) });
export const submitResponse = (responseId: number) => request<{ ok: boolean; thank_you_message: string }>(`/api/public/responses/${responseId}/submit`, { method: "POST" });
export const listResponses = (formId: number) => request<ResponseListItem[]>(`/api/forms/${formId}/responses`);
export const getResponse = (formId: number, responseId: number) => request<ResponseDetail>(`/api/forms/${formId}/responses/${responseId}`);
export const getStats = (formId: number) => request<FormStats>(`/api/forms/${formId}/stats`);
export const exportCsvUrl = (formId: number) => `${BASE_URL}/api/forms/${formId}/responses/export.csv`;
export { ApiError };
