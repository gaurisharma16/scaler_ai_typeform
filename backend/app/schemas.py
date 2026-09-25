from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


# ---------- Question options ----------

class OptionOut(BaseModel):
    id: int
    label: str
    order_index: int

    model_config = ConfigDict(from_attributes=True)


# ---------- Questions ----------

class QuestionCreate(BaseModel):
    type: str
    title: str
    description: Optional[str] = None
    required: bool = False
    settings: Optional[dict[str, Any]] = None
    options: Optional[list[str]] = None


class QuestionUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    required: Optional[bool] = None
    settings: Optional[dict[str, Any]] = None
    options: Optional[list[str]] = None


class QuestionOut(BaseModel):
    id: int
    form_id: int
    type: str
    title: str
    description: Optional[str] = None
    required: bool
    order_index: int
    canvas_x: Optional[float] = None
    canvas_y: Optional[float] = None
    settings: Optional[dict[str, Any]] = None
    options: list[OptionOut] = []

    model_config = ConfigDict(from_attributes=True)


class PositionUpdate(BaseModel):
    canvas_x: float
    canvas_y: float


class LogicRuleCreate(BaseModel):
    from_question_id: int
    to_question_id: int
    condition: Optional[dict[str, Any]] = None


class LogicRuleOut(BaseModel):
    id: int
    form_id: int
    from_question_id: int
    to_question_id: int
    condition_json: Optional[dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class ReorderRequest(BaseModel):
    question_ids: list[int]


# ---------- Forms ----------

class FormCreate(BaseModel):
    title: str


class FormUpdate(BaseModel):
    title: Optional[str] = None
    theme: Optional[dict[str, Any]] = None
    theme_color: Optional[str] = None
    thank_you_message: Optional[str] = None
    welcome_title: Optional[str] = None
    welcome_desc: Optional[str] = None
    thankyou_title: Optional[str] = None
    thankyou_desc: Optional[str] = None


class FormListOut(BaseModel):
    id: int
    title: str
    status: str
    share_slug: Optional[str] = None
    response_count: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FormOut(BaseModel):
    id: int
    title: str
    status: str
    share_slug: Optional[str] = None
    theme_color: Optional[str] = "#FF6B5E"
    theme: Optional[dict[str, Any]] = None
    thank_you_message: Optional[str] = None
    welcome_title: Optional[str] = None
    welcome_desc: Optional[str] = None
    thankyou_title: Optional[str] = None
    thankyou_desc: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    questions: list[QuestionOut] = []

    model_config = ConfigDict(from_attributes=True)


# ---------- Public respondent flow ----------

class PublicQuestionOut(BaseModel):
    id: int
    type: str
    title: str
    description: Optional[str] = None
    required: bool
    order_index: int
    settings: Optional[dict[str, Any]] = None
    options: list[OptionOut] = []

    model_config = ConfigDict(from_attributes=True)


class PublicFormOut(BaseModel):
    id: int
    title: str
    theme: Optional[dict[str, Any]] = None
    theme_color: Optional[str] = "#FF6B5E"
    thank_you_message: Optional[str] = None
    welcome_title: Optional[str] = None
    welcome_desc: Optional[str] = None
    thankyou_title: Optional[str] = None
    thankyou_desc: Optional[str] = None
    questions: list[PublicQuestionOut] = []

    model_config = ConfigDict(from_attributes=True)


class StartResponseOut(BaseModel):
    response_id: int


class AnswerIn(BaseModel):
    question_id: int
    value: Any = None


class SubmitError(BaseModel):
    question_id: int
    message: str


# ---------- Results ----------

class AnswerOut(BaseModel):
    id: int
    question_id: int
    value_text: Optional[str] = None
    value_json: Optional[Any] = None

    model_config = ConfigDict(from_attributes=True)


class ResponseListOut(BaseModel):
    id: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    completed: bool

    model_config = ConfigDict(from_attributes=True)


class ResponseDetailOut(BaseModel):
    id: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    completed: bool
    answers: list[AnswerOut] = []

    model_config = ConfigDict(from_attributes=True)


class QuestionStat(BaseModel):
    question_id: int
    title: str
    type: str
    total_answers: int
    option_counts: Optional[dict[str, int]] = None
    average: Optional[float] = None


class FormStatsOut(BaseModel):
    form_id: int
    total_responses: int
    completed_responses: int
    completion_rate: float
    questions: list[QuestionStat]
