from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import os
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
import base64

app = Flask(__name__)

# Configuration CORS
CORS(app, resources={r"/*": {"origins": "*"}}, expose_headers="Content-Type", allow_headers=["Content-Type"])

# Configuration de la base de données
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.abspath(os.getcwd()), 'users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Charger le modèle de prédiction des émotions
model = load_model('emotion_detection_model.h5')
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

# Charger le classificateur de visage une seule fois
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
if face_cascade.empty():
    raise Exception("Erreur lors du chargement du classificateur Haar.")

# Modèle User
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

# Route de test pour vérifier le fonctionnement
@app.route('/test', methods=['GET'])
def test_route():
    return jsonify({"message": "Test successful"}), 200

# Endpoint pour l'inscription (register)
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        name = data['name']
        email = data['email']
        password = data['password']

        # Vérifier si l'utilisateur existe déjà
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"message": "User already exists"}), 400

        # Hacher le mot de passe
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

        # Créer un nouvel utilisateur
        new_user = User(name=name, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User registered successfully", "id": new_user.id}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# Endpoint pour la connexion (signin)
@app.route('/signin', methods=['POST'])
def signin():
    try:
        data = request.get_json()
        email = data['email']
        password = data['password']

        # Vérifier si l'utilisateur existe
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "User does not exist"}), 400

        # Vérifier si le mot de passe est correct
        if not check_password_hash(user.password, password):
            return jsonify({"message": "Incorrect password"}), 401

        return jsonify({"message": "Login successful", "id": user.id, "name": user.name}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# Endpoint pour la prédiction des émotions à partir d'images (y compris les frames de vidéo)
@app.route('/predict', methods=['POST'])
def predict_emotion():
    try:
        data = request.json.get('image', None)
        if data is None:
            return jsonify({"message": "No image data provided"}), 400

        # Décoder l'image base64
        image_data = base64.b64decode(data)
        np_arr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if image is None:
            print("Erreur: image non décodée correctement")
            return jsonify({"message": "Invalid image data"}), 400

        # Convertir l'image en niveaux de gris pour la détection des visages
        gray_frame = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Détecter les visages dans l'image
        faces = face_cascade.detectMultiScale(
            gray_frame,
            scaleFactor=1.1,
            minNeighbors=3,
            minSize=(30, 30)
        )

        if len(faces) == 0:
            return jsonify({"message": "No faces detected"}), 200

        results = []
        for (x, y, w, h) in faces:
            # Extraire la région du visage
            face_roi = gray_frame[y:y + h, x:x + w]
            face_roi_resized = cv2.resize(face_roi, (48, 48))
            face_roi_resized = face_roi_resized.astype("float") / 255.0
            face_roi_resized = img_to_array(face_roi_resized)
            face_roi_resized = np.expand_dims(face_roi_resized, axis=0)

            # Prédire l'émotion
            prediction = model.predict(face_roi_resized)[0]
            max_index = np.argmax(prediction)
            emotion = emotion_labels[max_index]

            results.append({
                "emotion": emotion,
                "box": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)}
            })

        return jsonify(results)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"message": "Internal server error"}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5030)