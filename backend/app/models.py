import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


def gen_slug():
    return uuid.uuid4().hex[:10]


class Creator(Base):
    __tablename__ = "creators"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)

    forms = relationship("Form", back_populates="creator")


class Form(Base):
    __tablename__ = "forms"

    id = Column(Integer, primary_key=True)
    creator_id = Column(Integer, ForeignKey("creators.id"), nullable=False)
    title = Column(String, nullable=False)
    status = Column(String, nullable=False, default="draft")
    share_slug = Column(String, unique=True, nullable=True)
    theme_color = Column(String, default="#FF6B5E")
    theme = Column(JSON, default=dict)
    welcome_title = Column(Text, nullable=True)
    welcome_desc = Column(Text, nullable=True)
    thank_you_message = Column(Text, default="Thanks for completing this form!")
    thankyou_title = Column(Text, default="Thanks for completing this form!")
    thankyou_desc = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = relationship("Creator", back_populates="forms")
    questions = relationship(
        "Question", back_populates="form", cascade="all, delete-orphan", order_by="Question.order_index"
    )
    responses = relationship("Response", back_populates="form", cascade="all, delete-orphan")
    logic_rules = relationship("LogicRule", back_populates="form", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True)
    form_id = Column(Integer, ForeignKey("forms.id"), nullable=False)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    required = Column(Boolean, default=False)
    order_index = Column(Integer, nullable=False, default=0)
    canvas_x = Column(Float, nullable=True)
    canvas_y = Column(Float, nullable=True)
    settings = Column(JSON, default=dict)

    form = relationship("Form", back_populates="questions")
    options = relationship(
        "QuestionOption", back_populates="question", cascade="all, delete-orphan", order_by="QuestionOption.order_index"
    )
    answers = relationship("Answer", back_populates="question")


class QuestionOption(Base):
    __tablename__ = "question_options"

    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    label = Column(String, nullable=False)
    order_index = Column(Integer, nullable=False, default=0)

    question = relationship("Question", back_populates="options")


class LogicRule(Base):
    __tablename__ = "logic_rules"

    id = Column(Integer, primary_key=True)
    form_id = Column(Integer, ForeignKey("forms.id"), nullable=False)
    from_question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    to_question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    condition_json = Column(JSON, nullable=True)

    form = relationship("Form", back_populates="logic_rules")


class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True)
    form_id = Column(Integer, ForeignKey("forms.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    completed = Column(Boolean, default=False)

    form = relationship("Form", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True)
    response_id = Column(Integer, ForeignKey("responses.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    value_text = Column(Text, nullable=True)
    value_json = Column(JSON, nullable=True)

    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")
