export type QuestionType = "short_text" | "long_text" | "multiple_choice" | "dropdown" | "email" | "number" | "yes_no" | "rating";

export interface QuestionOption { id: number; label: string; order_index: number; }
export interface Question {
  id: number; form_id: number; type: QuestionType; title: string; description: string | null;
  required: boolean; order_index: number; canvas_x: number | null; canvas_y: number | null;
  settings: Record<string, unknown> | null; options: QuestionOption[];
}
export interface FormListItem { id: number; title: string; status: "draft" | "published"; share_slug: string | null; response_count: number; updated_at: string; }
export interface FormDetail {
  id: number; title: string; status: "draft" | "published"; share_slug: string | null;
  theme_color: string | null; theme: Record<string, unknown> | null; thank_you_message: string | null;
  welcome_title: string | null; welcome_desc: string | null; thankyou_title: string | null; thankyou_desc: string | null;
  created_at: string; updated_at: string; questions: Question[];
}
export interface PublicForm {
  id: number; title: string; theme_color: string | null; theme: { primaryColor?: string; font?: string } | null;
  thank_you_message: string | null; welcome_title: string | null; welcome_desc: string | null;
  thankyou_title: string | null; thankyou_desc: string | null; questions: Question[];
}
export interface ResponseListItem { id: number; started_at: string; completed_at: string | null; completed: boolean; }
export interface Answer { id: number; question_id: number; value_text: string | null; value_json: unknown; }
export interface ResponseDetail { id: number; started_at: string; completed_at: string | null; completed: boolean; answers: Answer[]; }
export interface QuestionStat { question_id: number; title: string; type: QuestionType; total_answers: number; option_counts: Record<string, number> | null; average: number | null; }
export interface FormStats { form_id: number; total_responses: number; completed_responses: number; completion_rate: number; questions: QuestionStat[]; }
export interface LogicRule { id: number; form_id: number; from_question_id: number; to_question_id: number; condition_json: Record<string, unknown> | null; }
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = { short_text: "Short text", long_text: "Long text", multiple_choice: "Multiple choice", dropdown: "Dropdown", email: "Email", number: "Number", yes_no: "Yes / No", rating: "Rating" };
