from flask import Flask, jsonify
from flask_cors import CORS

from routes.user_routes import user_routes


app = Flask(__name__)
CORS(app)



@app.route("/")
def home():
    return jsonify({"message": "Backend running successfully!"})

app.register_blueprint(user_routes)
if __name__ == "__main__":
    app.run(debug=True)