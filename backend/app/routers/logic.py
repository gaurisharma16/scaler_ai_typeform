from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(tags=["logic"])


def rebuild_linear_edges(db: Session, form: models.Form):
    ordered = sorted(form.questions, key=lambda q: q.order_index)
    existing = db.query(models.LogicRule).filter(models.LogicRule.form_id == form.id).all()
    custom = [e for e in existing if e.condition_json]
    if custom:
        return
    for e in existing:
        db.delete(e)
    for a, b in zip(ordered, ordered[1:]):
        db.add(
            models.LogicRule(
                form_id=form.id,
                from_question_id=a.id,
                to_question_id=b.id,
                condition_json=None,
            )
        )


@router.get("/api/forms/{form_id}/logic", response_model=list[schemas.LogicRuleOut])
def list_logic(form_id: int, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if not form.logic_rules and form.questions:
        rebuild_linear_edges(db, form)
        db.commit()
        db.refresh(form)
    return form.logic_rules


@router.post("/api/forms/{form_id}/logic", response_model=schemas.LogicRuleOut)
def create_logic(form_id: int, payload: schemas.LogicRuleCreate, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    qids = {q.id for q in form.questions}
    if payload.from_question_id not in qids or payload.to_question_id not in qids:
        raise HTTPException(status_code=400, detail="Questions must belong to this form")
    rule = models.LogicRule(
        form_id=form_id,
        from_question_id=payload.from_question_id,
        to_question_id=payload.to_question_id,
        condition_json=payload.condition,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/api/logic/{rule_id}")
def delete_logic(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(models.LogicRule).filter(models.LogicRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Logic rule not found")
    db.delete(rule)
    db.commit()
    return {"ok": True}
