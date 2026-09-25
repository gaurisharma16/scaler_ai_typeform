from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(tags=["questions"])

VALID_TYPES = {
    "short_text",
    "long_text",
    "multiple_choice",
    "dropdown",
    "email",
    "number",
    "yes_no",
    "rating",
}


def apply_options(db: Session, question: models.Question, options: list[str] | None):
    if options is None:
        return
    for opt in list(question.options):
        db.delete(opt)
    for idx, label in enumerate(options):
        db.add(models.QuestionOption(question_id=question.id, label=label, order_index=idx))


@router.post("/api/forms/{form_id}/questions", response_model=schemas.QuestionOut)
def create_question(form_id: int, payload: schemas.QuestionCreate, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if payload.type not in VALID_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid question type: {payload.type}")

    max_order = max([q.order_index for q in form.questions], default=-1)
    question = models.Question(
        form_id=form_id,
        type=payload.type,
        title=payload.title,
        description=payload.description,
        required=payload.required,
        order_index=max_order + 1,
        canvas_x=80.0,
        canvas_y=float((max_order + 1) * 140),
        settings=payload.settings or {},
    )
    db.add(question)
    db.flush()
    apply_options(db, question, payload.options)
    from app.routers.logic import rebuild_linear_edges

    rebuild_linear_edges(db, form)
    db.commit()
    db.refresh(question)
    return question


@router.patch("/api/questions/{question_id}", response_model=schemas.QuestionOut)
def update_question(question_id: int, payload: schemas.QuestionUpdate, db: Session = Depends(get_db)):
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    data = payload.model_dump(exclude_unset=True, exclude={"options"})
    for key, value in data.items():
        setattr(question, key, value)

    if payload.options is not None:
        apply_options(db, question, payload.options)

    db.commit()
    db.refresh(question)
    return question


@router.delete("/api/questions/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.query(models.LogicRule).filter(
        (models.LogicRule.from_question_id == question_id) | (models.LogicRule.to_question_id == question_id)
    ).delete(synchronize_session=False)
    db.delete(question)
    db.commit()
    return {"ok": True}


@router.patch("/api/questions/{question_id}/position", response_model=schemas.QuestionOut)
def update_position(question_id: int, payload: schemas.PositionUpdate, db: Session = Depends(get_db)):
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    question.canvas_x = payload.canvas_x
    question.canvas_y = payload.canvas_y
    db.commit()
    db.refresh(question)
    return question


@router.post("/api/forms/{form_id}/questions/reorder")
def reorder_questions(form_id: int, payload: schemas.ReorderRequest, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    questions_by_id = {q.id: q for q in form.questions}
    if set(payload.question_ids) != set(questions_by_id.keys()):
        raise HTTPException(status_code=400, detail="question_ids must match the form's existing questions")

    for idx, qid in enumerate(payload.question_ids):
        questions_by_id[qid].order_index = idx

    from app.routers.logic import rebuild_linear_edges

    rebuild_linear_edges(db, form)
    db.commit()
    return {"ok": True}
