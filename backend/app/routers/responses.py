import csv
import io

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/forms/{form_id}", tags=["responses"])


def get_form_or_404(db: Session, form_id: int) -> models.Form:
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


@router.get("/responses", response_model=list[schemas.ResponseListOut])
def list_responses(form_id: int, db: Session = Depends(get_db)):
    get_form_or_404(db, form_id)
    return (
        db.query(models.Response)
        .filter(models.Response.form_id == form_id)
        .order_by(models.Response.started_at.desc())
        .all()
    )


@router.get("/responses/export.csv")
def export_csv(form_id: int, db: Session = Depends(get_db)):
    form = get_form_or_404(db, form_id)
    responses = (
        db.query(models.Response)
        .filter(models.Response.form_id == form_id)
        .order_by(models.Response.started_at.asc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    header = ["response_id", "started_at", "completed_at", "completed"] + [q.title for q in form.questions]
    writer.writerow(header)

    for r in responses:
        answers_by_qid = {a.question_id: a for a in r.answers}
        row = [r.id, r.started_at, r.completed_at, r.completed]
        for q in form.questions:
            a = answers_by_qid.get(q.id)
            value = ""
            if a:
                value = a.value_text if a.value_text is not None else (a.value_json or "")
            row.append(value)
        writer.writerow(row)

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=form_{form_id}_responses.csv"},
    )


@router.get("/responses/{response_id}", response_model=schemas.ResponseDetailOut)
def get_response(form_id: int, response_id: int, db: Session = Depends(get_db)):
    get_form_or_404(db, form_id)
    response = (
        db.query(models.Response)
        .filter(models.Response.id == response_id, models.Response.form_id == form_id)
        .first()
    )
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    return response


@router.get("/stats", response_model=schemas.FormStatsOut)
@router.get("/summary", response_model=schemas.FormStatsOut)
def get_stats(form_id: int, db: Session = Depends(get_db)):
    form = get_form_or_404(db, form_id)
    responses = db.query(models.Response).filter(models.Response.form_id == form_id).all()
    total = len(responses)
    completed = len([r for r in responses if r.completed])

    question_stats = []
    for q in form.questions:
        answers = [a for r in responses for a in r.answers if a.question_id == q.id]
        stat = schemas.QuestionStat(question_id=q.id, title=q.title, type=q.type, total_answers=len(answers))

        if q.type in ("multiple_choice", "dropdown", "yes_no"):
            counts: dict[str, int] = {}
            for a in answers:
                val = a.value_text or (a.value_json if isinstance(a.value_json, str) else None)
                if val:
                    counts[val] = counts.get(val, 0) + 1
            stat.option_counts = counts
        elif q.type in ("rating", "number"):
            nums = []
            for a in answers:
                try:
                    nums.append(float(a.value_text))
                except (TypeError, ValueError):
                    pass
            if nums:
                stat.average = round(sum(nums) / len(nums), 2)

        question_stats.append(stat)

    return schemas.FormStatsOut(
        form_id=form_id,
        total_responses=total,
        completed_responses=completed,
        completion_rate=round((completed / total) * 100, 1) if total else 0.0,
        questions=question_stats,
    )
