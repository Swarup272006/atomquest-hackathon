from flask import Blueprint, request, jsonify
import sqlite3

user_routes = Blueprint("user_routes", __name__)

# Database connection
conn = sqlite3.connect("atomquest.db", check_same_thread=False)
cursor = conn.cursor()

# ---------------- USERS TABLE ----------------

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    password TEXT,
    role TEXT
)
""")

# ---------------- GOALS TABLE ----------------

cursor.execute("""
CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    title TEXT,
    description TEXT,
    uom_type TEXT,
    target_value INTEGER,
    weightage INTEGER,
    status TEXT,
    approved_by INTEGER,
    locked INTEGER DEFAULT 0
)
""")

# ---------------- PROGRESS TABLE ----------------

cursor.execute("""
CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_id INTEGER,
    employee_id INTEGER,
    quarter TEXT,
    achievement INTEGER,
    progress_status TEXT,
    comment TEXT
)
""")

conn.commit()

# =========================================================
# REGISTER
# =========================================================

@user_routes.route("/register", methods=["POST"])
def register():

    data = request.json

    cursor.execute("""
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
    """, (
        data["name"],
        data["email"],
        data["password"],
        data["role"]
    ))

    conn.commit()

    return jsonify({
        "message": "User registered successfully"
    })

# =========================================================
# LOGIN
# =========================================================

@user_routes.route("/login", methods=["POST"])
def login():

    data = request.json

    cursor.execute("""
    SELECT * FROM users
    WHERE email = ? AND password = ?
    """, (
        data["email"],
        data["password"]
    ))

    user = cursor.fetchone()

    if user:

        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "role": user[4]
            }
        })

    else:

        return jsonify({
            "message": "Invalid credentials"
        }), 401

# =========================================================
# CREATE GOAL
# =========================================================

@user_routes.route("/create-goal", methods=["POST"])
def create_goal():

    data = request.json

    employee_id = data["employee_id"]

    # Check current goal count
    cursor.execute("""
    SELECT COUNT(*) FROM goals
    WHERE employee_id = ?
    """, (employee_id,))

    goal_count = cursor.fetchone()[0]

    if goal_count >= 8:
        return jsonify({
            "message": "Maximum 8 goals allowed"
        }), 400

    # Check total weightage
    cursor.execute("""
    SELECT SUM(weightage) FROM goals
    WHERE employee_id = ?
    """, (employee_id,))

    current_weightage = cursor.fetchone()[0]

    if current_weightage is None:
        current_weightage = 0

    new_total = current_weightage + data["weightage"]

    if data["weightage"] < 10:
        return jsonify({
            "message": "Minimum weightage per goal is 10%"
        }), 400

    if new_total > 100:
        return jsonify({
            "message": "Total weightage cannot exceed 100%"
        }), 400

    # Insert goal
    cursor.execute("""
    INSERT INTO goals (
        employee_id,
        title,
        description,
        uom_type,
        target_value,
        weightage,
        status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        employee_id,
        data["title"],
        data["description"],
        data["uom_type"],
        data["target_value"],
        data["weightage"],
        "pending"
    ))

    conn.commit()

    return jsonify({
        "message": "Goal created successfully"
    })

# =========================================================
# APPROVE GOAL
# =========================================================

@user_routes.route("/approve-goal/<int:goal_id>", methods=["PUT"])
def approve_goal(goal_id):

    data = request.json

    manager_id = data["manager_id"]

    # Check if goal exists
    cursor.execute("""
    SELECT * FROM goals
    WHERE id = ?
    """, (goal_id,))

    goal = cursor.fetchone()

    if not goal:
        return jsonify({
            "message": "Goal not found"
        }), 404

    # Approve and lock goal
    cursor.execute("""
    UPDATE goals
    SET status = ?, approved_by = ?, locked = ?
    WHERE id = ?
    """, (
        "approved",
        manager_id,
        1,
        goal_id
    ))

    conn.commit()

    return jsonify({
        "message": "Goal approved and locked successfully"
    })

# =========================================================
# UPDATE PROGRESS
# =========================================================

@user_routes.route("/update-progress", methods=["POST"])
def update_progress():

    data = request.json

    # Check if goal is approved
    cursor.execute("""
    SELECT locked FROM goals
    WHERE id = ?
    """, (data["goal_id"],))

    goal = cursor.fetchone()

    if not goal:
        return jsonify({
            "message": "Goal not found"
        }), 404

    if goal[0] != 1:
        return jsonify({
            "message": "Goal not approved yet"
        }), 400

    # Insert progress update
    cursor.execute("""
    INSERT INTO progress (
        goal_id,
        employee_id,
        quarter,
        achievement,
        progress_status,
        comment
    )
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        data["goal_id"],
        data["employee_id"],
        data["quarter"],
        data["achievement"],
        data["progress_status"],
        data["comment"]
    ))

    conn.commit()

    return jsonify({
        "message": "Progress updated successfully"
    })

# =========================================================
# GET GOALS
# =========================================================

@user_routes.route("/get-goals/<int:employee_id>", methods=["GET"])
def get_goals(employee_id):

    cursor.execute("""
    SELECT id, title, description, weightage, status
    FROM goals
    WHERE employee_id = ?
    """, (employee_id,))

    goals = cursor.fetchall()

    goal_list = []

    for goal in goals:

        goal_list.append({
            "id": goal[0],
            "title": goal[1],
            "description": goal[2],
            "weightage": goal[3],
            "status": goal[4]
        })

    return jsonify(goal_list)