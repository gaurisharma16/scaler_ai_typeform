from datetime import datetime, timedelta

from app import models
from app.database import SessionLocal


def _linear_edges(db, form):
    qs = sorted(form.questions, key=lambda q: q.order_index)
    for a, b in zip(qs, qs[1:]):
        db.add(models.LogicRule(form_id=form.id, from_question_id=a.id, to_question_id=b.id))


def seed():
    db = SessionLocal()
    try:
        if db.query(models.Creator).first():
            return

        creator = models.Creator(name="Default Creator", email="creator@example.com")
        db.add(creator)
        db.flush()

        form1 = models.Form(
            creator_id=creator.id,
            title="Customer Feedback",
            status="published",
            share_slug="customer-feedback",
            theme_color="#FF6B5E",
            theme={"primaryColor": "#FF6B5E", "font": "Inter"},
            welcome_title="Customer feedback",
            welcome_desc="Takes about a minute. We read every response.",
            thank_you_message="Thanks for sharing your feedback!",
            thankyou_title="Thanks for sharing your feedback!",
        )
        db.add(form1)
        db.flush()

        q1 = models.Question(
            form_id=form1.id, type="short_text", title="What's your name?", required=True, order_index=0, canvas_x=80, canvas_y=40
        )
        q2 = models.Question(
            form_id=form1.id, type="email", title="What's the best way to reach you?", required=True, order_index=1, canvas_x=80, canvas_y=180
        )
        q3 = models.Question(
            form_id=form1.id,
            type="rating",
            title="Rate your experience with us",
            required=True,
            order_index=2,
            settings={"max_rating": 5},
            canvas_x=80,
            canvas_y=320,
        )
        q4 = models.Question(
            form_id=form1.id,
            type="multiple_choice",
            title="Which feature do you use most?",
            required=True,
            order_index=3,
            canvas_x=80,
            canvas_y=460,
        )
        q5 = models.Question(
            form_id=form1.id,
            type="long_text",
            title="How can we improve?",
            required=False,
            order_index=4,
            canvas_x=80,
            canvas_y=600,
        )
        db.add_all([q1, q2, q3, q4, q5])
        db.flush()
        for idx, label in enumerate(["Dashboard", "Reports", "Integrations", "Mobile app"]):
            db.add(models.QuestionOption(question_id=q4.id, label=label, order_index=idx))
        _linear_edges(db, form1)

        form2 = models.Form(
            creator_id=creator.id,
            title="Event RSVP",
            status="published",
            share_slug="event-rsvp",
            theme_color="#FF6B5E",
            theme={"primaryColor": "#FF6B5E"},
            welcome_title="You're invited",
            welcome_desc="Let us know if you can make it.",
            thank_you_message="See you there!",
            thankyou_title="See you there!",
        )
        db.add(form2)
        db.flush()

        r1 = models.Question(form_id=form2.id, type="short_text", title="Full name", required=True, order_index=0, canvas_x=80, canvas_y=40)
        r2 = models.Question(form_id=form2.id, type="yes_no", title="Will you attend?", required=True, order_index=1, canvas_x=80, canvas_y=180)
        r3 = models.Question(form_id=form2.id, type="number", title="How many guests?", required=False, order_index=2, canvas_x=80, canvas_y=320)
        r4 = models.Question(form_id=form2.id, type="dropdown", title="Meal preference", required=False, order_index=3, canvas_x=80, canvas_y=460)
        db.add_all([r1, r2, r3, r4])
        db.flush()
        for idx, label in enumerate(["Vegetarian", "Non-vegetarian", "Vegan"]):
            db.add(models.QuestionOption(question_id=r4.id, label=label, order_index=idx))
        _linear_edges(db, form2)

        form3 = models.Form(creator_id=creator.id, title="Product Survey (draft)", status="draft", theme_color="#FF6B5E")
        db.add(form3)
        db.flush()
        db.add(
            models.Question(
                form_id=form3.id, type="short_text", title="What product do you use?", order_index=0, canvas_x=80, canvas_y=40
            )
        )

        names = [
            ("Jane Doe", "jane@acme.com"),
            ("Leo Park", "leo@studio.io"),
            ("Priya Shah", "priya@getform.co"),
            ("Aditi Sharma", "aditi@example.com"),
            ("Rohan Verma", "rohan@example.com"),
            ("Meera Iyer", "meera@example.com"),
            ("Karan Mehta", "karan@example.com"),
            ("Sara Kim", "sara@example.com"),
            ("Noah Ellis", "noah@example.com"),
            ("Ava Chen", "ava@example.com"),
            ("Omar Ali", "omar@example.com"),
            ("Rita Bose", "rita@example.com"),
            ("James Wu", "james@example.com"),
            ("Nina Patel", "nina@example.com"),
        ]
        features = ["Dashboard", "Reports", "Integrations", "Mobile app"]
        now = datetime.utcnow()

        for i, (name, email) in enumerate(names):
            done = i != 3
            started = now - timedelta(days=2, hours=i)
            resp = models.Response(
                form_id=form1.id,
                started_at=started,
                completed=done,
                completed_at=started + timedelta(minutes=2) if done else None,
            )
            db.add(resp)
            db.flush()
            db.add(models.Answer(response_id=resp.id, question_id=q1.id, value_text=name))
            if i > 0:
                db.add(models.Answer(response_id=resp.id, question_id=q2.id, value_text=email))
            if done:
                rating = str((i % 5) + 1)
                db.add(models.Answer(response_id=resp.id, question_id=q3.id, value_text=rating))
                db.add(models.Answer(response_id=resp.id, question_id=q4.id, value_text=features[i % 4]))
                if i % 3 == 0:
                    db.add(models.Answer(response_id=resp.id, question_id=q5.id, value_text="Great overall."))

        rsvp_names = names[:12]
        meals = ["Vegetarian", "Non-vegetarian", "Vegan"]
        for i, (name, _) in enumerate(rsvp_names):
            started = now - timedelta(days=1, hours=i)
            resp = models.Response(
                form_id=form2.id,
                started_at=started,
                completed=True,
                completed_at=started + timedelta(minutes=1),
            )
            db.add(resp)
            db.flush()
            attend = "yes" if i % 4 != 0 else "no"
            db.add_all(
                [
                    models.Answer(response_id=resp.id, question_id=r1.id, value_text=name),
                    models.Answer(response_id=resp.id, question_id=r2.id, value_text=attend),
                    models.Answer(response_id=resp.id, question_id=r3.id, value_text=str((i % 3) + 1)),
                    models.Answer(response_id=resp.id, question_id=r4.id, value_text=meals[i % 3]),
                ]
            )

        db.commit()
        print("Database seeded.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
