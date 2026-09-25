import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/public", tags=["public"])

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def get_published_form(db: Session, slug: str) -> models.Form:
    form = (
        db.query(models.Form)
        .filter(models.Form.share_slug == slug, models.Form.status == "published")
        .first()
    )
    if not form:
        raise HTTPException(status_code=404, detail="Form not found or not published")
    return form


def validate_answer(question: models.Question, value) -> str | None:
    """Returns an error message, or None if valid."""
    is_empty = value is None or value == "" or value == []
    if question.required and is_empty:
        return "This question is required"
    if is_empty:
        return None

    if question.type == "email" and not EMAIL_RE.match(str(value)):
        return "Enter a valid email address"
    if question.type == "number":
        try:
            float(value)
        except (TypeError, ValueError):
            return "Enter a valid number"
    if question.type in ("multiple_choice", "dropdown"):
        valid_labels = {opt.label for opt in question.options}
        if str(value) not in valid_labels:
            return "Select a valid option"
    if question.type == "yes_no" and str(value) not in ("yes", "no"):
        return "Select yes or no"
    if question.type == "rating":
        max_rating = (question.settings or {}).get("max_rating", 5)
        try:
            n = int(value)
            if n < 1 or n > max_rating:
                return f"Rating must be between 1 and {max_rating}"
        except (TypeError, ValueError):
            return "Enter a valid rating"
    return None


@router.get("/forms/{slug}", response_model=schemas.PublicFormOut)
def get_public_form(slug: str, db: Session = Depends(get_db)):
    return get_published_form(db, slug)


@router.post("/forms/{slug}/responses/start", response_model=schemas.StartResponseOut)
@router.post("/forms/{slug}/responses", response_model=schemas.StartResponseOut)
def start_response(slug: str, db: Session = Depends(get_db)):
    form = get_published_form(db, slug)
    response = models.Response(form_id=form.id)
    db.add(response)
    db.commit()
    db.refresh(response)
    return schemas.StartResponseOut(response_id=response.id)


@router.patch("/responses/{response_id}/answers")
def upsert_answer(response_id: int, payload: schemas.AnswerIn, db: Session = Depends(get_db)):
    response = db.query(models.Response).filter(models.Response.id == response_id).first()
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")

    question = db.query(models.Question).filter(models.Question.id == payload.question_id).first()
    if not question or question.form_id != response.form_id:
        raise HTTPException(status_code=400, detail="Question does not belong to this form")

    error = validate_answer(question, payload.value)
    if error:
        raise HTTPException(status_code=400, detail=error)

    answer = (
        db.query(models.Answer)
        .filter(models.Answer.response_id == response_id, models.Answer.question_id == payload.question_id)
        .first()
    )
    if not answer:
        answer = models.Answer(response_id=response_id, question_id=payload.question_id)
        db.add(answer)

    if isinstance(payload.value, (dict, list)):
        answer.value_json = payload.value
        answer.value_text = None
    else:
        answer.value_text = None if payload.value is None else str(payload.value)
        answer.value_json = None

    db.commit()
    return {"ok": True}


@router.post("/responses/{response_id}/submit")
@router.post("/responses/{response_id}/complete")
def submit_response(response_id: int, db: Session = Depends(get_db)):
    response = db.query(models.Response).filter(models.Response.id == response_id).first()
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")

    form = db.query(models.Form).filter(models.Form.id == response.form_id).first()
    answers_by_qid = {a.question_id: a for a in response.answers}

    errors = []
    for question in form.questions:
        answer = answers_by_qid.get(question.id)
        value = None
        if answer:
            value = answer.value_json if answer.value_json is not None else answer.value_text
        error = validate_answer(question, value)
        if error:
            errors.append(schemas.SubmitError(question_id=question.id, message=error))

    if errors:
        raise HTTPException(status_code=400, detail=[e.model_dump() for e in errors])

    from datetime import datetime

    response.completed = True
    response.completed_at = datetime.utcnow()
    db.commit()
    return {"ok": True, "thank_you_message": form.thank_you_message}
