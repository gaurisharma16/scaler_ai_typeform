from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/forms", tags=["forms"])


def get_default_creator(db: Session) -> models.Creator:
    creator = db.query(models.Creator).first()
    if not creator:
        creator = models.Creator(name="Default Creator", email="creator@example.com")
        db.add(creator)
        db.commit()
        db.refresh(creator)
    return creator


@router.get("", response_model=list[schemas.FormListOut])
def list_forms(db: Session = Depends(get_db)):
    forms = db.query(models.Form).order_by(models.Form.updated_at.desc()).all()
    out = []
    for f in forms:
        count = db.query(func.count(models.Response.id)).filter(models.Response.form_id == f.id).scalar()
        out.append(
            schemas.FormListOut(
                id=f.id,
                title=f.title,
                status=f.status,
                share_slug=f.share_slug,
                response_count=count or 0,
                updated_at=f.updated_at,
            )
        )
    return out


@router.post("", response_model=schemas.FormOut)
def create_form(payload: schemas.FormCreate, db: Session = Depends(get_db)):
    creator = get_default_creator(db)
    form = models.Form(title=payload.title, creator_id=creator.id, status="draft")
    db.add(form)
    db.commit()
    db.refresh(form)
    return form


@router.get("/{form_id}", response_model=schemas.FormOut)
def get_form(form_id: int, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


@router.patch("/{form_id}", response_model=schemas.FormOut)
def update_form(form_id: int, payload: schemas.FormUpdate, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(form, key, value)
    db.commit()
    db.refresh(form)
    return form


@router.delete("/{form_id}")
def delete_form(form_id: int, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    db.delete(form)
    db.commit()
    return {"ok": True}


@router.post("/{form_id}/duplicate", response_model=schemas.FormOut)
def duplicate_form(form_id: int, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    new_form = models.Form(
        title=f"{form.title} (copy)",
        creator_id=form.creator_id,
        status="draft",
        theme=form.theme,
        theme_color=form.theme_color,
        thank_you_message=form.thank_you_message,
        welcome_title=form.welcome_title,
        welcome_desc=form.welcome_desc,
        thankyou_title=form.thankyou_title,
        thankyou_desc=form.thankyou_desc,
    )
    db.add(new_form)
    db.flush()

    id_map: dict[int, int] = {}
    for q in form.questions:
        new_q = models.Question(
            form_id=new_form.id,
            type=q.type,
            title=q.title,
            description=q.description,
            required=q.required,
            order_index=q.order_index,
            canvas_x=q.canvas_x,
            canvas_y=q.canvas_y,
            settings=q.settings,
        )
        db.add(new_q)
        db.flush()
        id_map[q.id] = new_q.id
        for opt in q.options:
            db.add(models.QuestionOption(question_id=new_q.id, label=opt.label, order_index=opt.order_index))

    for rule in form.logic_rules:
        db.add(
            models.LogicRule(
                form_id=new_form.id,
                from_question_id=id_map[rule.from_question_id],
                to_question_id=id_map[rule.to_question_id],
                condition_json=rule.condition_json,
            )
        )

    db.commit()
    db.refresh(new_form)
    return new_form


@router.post("/{form_id}/publish", response_model=schemas.FormOut)
def publish_form(form_id: int, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if not form.questions:
        raise HTTPException(status_code=400, detail="Cannot publish a form with no questions")
    if not form.share_slug:
        form.share_slug = models.gen_slug()
    form.status = "published"
    db.commit()
    db.refresh(form)
    return form


@router.post("/{form_id}/unpublish", response_model=schemas.FormOut)
def unpublish_form(form_id: int, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    form.status = "draft"
    db.commit()
    db.refresh(form)
    return form
