# we are using Flask & SQLite
# Flask: a Python web framework used to create web apps
# Flask is connecting the frontend w/ the backend 
#
# SQLite: a database system used to store users and journal entries locally on your computer.

from flask import Flask, render_template, request, redirect, session, jsonify
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

# initalizes the app 
app = Flask(__name__)
app.secret_key = "secretlollllidk"  

# connects SQLite
def get_db():
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row  
    return conn

# main page 
@app.route("/")
def home():
    return render_template("home.html")

# for new users 
@app.route("/register", methods=["POST"])
def register():
    username = request.form["username"]
    password = request.form["password"]
    hashed_pw = generate_password_hash(password)  

    db = get_db()
    try:
        db.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed_pw))
        db.commit()
        return jsonify({"success": True})
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Username already taken!"})
    finally:
        db.close()

# authentication 
@app.route("/login", methods=["POST"])
def login():
    username = request.form["username"]
    password = request.form["password"]

    db = get_db()
    user = db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    db.close()

    if user and check_password_hash(user["password"], password):
        session["user_id"] = user["id"]
        session["username"] = user["username"]
        return jsonify({"success": True, "username": username})
    else:
        return jsonify({"success": False})

# logging out
@app.route("/logout")
def logout():
    session.pop("user_id", None)
    session.pop("username", None)
    return '', 204

# journal entry saving 
@app.route("/entries", methods=["GET", "POST", "PATCH", "DELETE"])
def entries():
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 403

    db = get_db()

    if request.method == "POST":
        content = request.form["content"]
        timestamp = request.form["timestamp"]

        cursor = db.execute("INSERT INTO entries (user_id, content, timestamp) VALUES (?, ?, ?)",
                            (session["user_id"], content, timestamp))
        entry_id = cursor.lastrowid
        db.commit()
        db.close()
        return jsonify({"success": True, "id": entry_id})

    elif request.method == "GET":
        user_entries = db.execute(
            "SELECT id, content, timestamp, favorite FROM entries WHERE user_id = ? ORDER BY id DESC",
            (session["user_id"],)
        ).fetchall()
        db.close()

        entries_list = [
            {
                "id": row["id"],
                "content": row["content"],
                "timestamp": row["timestamp"],
                "favorite": row["favorite"]
            }
            for row in user_entries
        ]
        return jsonify(entries_list)

    elif request.method == "PATCH":
        entry_id = request.form["id"]
        new_favorite = request.form["favorite"]
        db.execute("UPDATE entries SET favorite = ? WHERE id = ? AND user_id = ?",
                   (new_favorite, entry_id, session["user_id"]))
        db.commit()
        db.close()
        return jsonify({"success": True})

    elif request.method == "DELETE":
        entry_id = request.form["id"]
        db.execute("DELETE FROM entries WHERE id = ? AND user_id = ?",
                   (entry_id, session["user_id"]))
        db.commit()
        db.close()
        return jsonify({"success": True})

@app.route("/flashcards", methods=["GET", "POST", "DELETE"])
def flashcards():
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 403

    db = get_db()

    if request.method == "POST":
        set_name = request.form["set"]
        question = request.form["question"]
        answer = request.form["answer"]

        db.execute("INSERT INTO flashcards (user_id, set_name, question, answer) VALUES (?, ?, ?, ?)",
                   (session["user_id"], set_name, question, answer))
        db.commit()
        db.close()
        return jsonify({"success": True})

    elif request.method == "GET":
        rows = db.execute("SELECT id, set_name, question, answer FROM flashcards WHERE user_id = ? ORDER BY id DESC",
                          (session["user_id"],)).fetchall()
        db.close()

        return jsonify([{
            "id": row["id"],
            "set": row["set_name"],
            "question": row["question"],
            "answer": row["answer"]
        } for row in rows])

    elif request.method == "DELETE":
        card_id = request.form["id"]
        db.execute("DELETE FROM flashcards WHERE id = ? AND user_id = ?", (card_id, session["user_id"]))
        db.commit()
        db.close()
        return jsonify({"success": True})

# runs the app
if __name__ == "__main__":
    app.run(debug=True)

# to open the cafe:
# type pip install flask and wait (make sure you are in the folder where app.py is located)
# type python app.py
# open the link it gives you in the browser
