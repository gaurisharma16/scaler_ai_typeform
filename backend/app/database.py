import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "typeform_clone.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def ensure_schema_compatibility() -> None:
    """Add columns for newer app schema versions without forcing a DB reset."""
    with engine.begin() as conn:
        existing = {
            row[1]: row
            for row in conn.exec_driver_sql("PRAGMA table_info(forms)").fetchall()
        }

        form_columns = {
            "theme_color": "VARCHAR DEFAULT '#FF6B5E'",
            "welcome_title": "TEXT",
            "welcome_desc": "TEXT",
            "thankyou_title": "TEXT DEFAULT 'Thanks for completing this form!'",
            "thankyou_desc": "TEXT",
        }
        for column_name, definition in form_columns.items():
            if column_name not in existing:
                conn.exec_driver_sql(f"ALTER TABLE forms ADD COLUMN {column_name} {definition}")

        existing_questions = {
            row[1]: row
            for row in conn.exec_driver_sql("PRAGMA table_info(questions)").fetchall()
        }
        question_columns = {
            "canvas_x": "FLOAT",
            "canvas_y": "FLOAT",
        }
        for column_name, definition in question_columns.items():
            if column_name not in existing_questions:
                conn.exec_driver_sql(f"ALTER TABLE questions ADD COLUMN {column_name} {definition}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
