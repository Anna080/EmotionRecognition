import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import json

# Charger le modèle sauvegardé
def model_fn(model_dir):
    """
    Charger le modèle Keras sauvegardé à partir du répertoire fourni.
    """
    model_path = os.path.join(model_dir, 'emotion_detection_model.h5')
    model = load_model(model_path)
    return model

# Prétraiter les données d'entrée
def input_fn(request_body, content_type='application/json'):
    """
    Préparer les données d'entrée pour l'inférence.
    """
    if content_type == 'application/json':
        input_data = json.loads(request_body)
        pixels = np.array(input_data['instances']).astype('float32')
        # Redimensionner les données d'entrée selon le format attendu par le modèle (48x48, 1 canal)
        pixels = pixels.reshape(-1, 48, 48, 1)
        pixels /= 255.0  # Normalisation des pixels entre 0 et 1
        return pixels
    else:
        raise ValueError(f"Le type de contenu {content_type} n'est pas supporté")

# Effectuer l'inférence avec le modèle
def predict_fn(input_data, model):
    """
    Exécuter l'inférence en utilisant le modèle chargé.
    """
    predictions = model.predict(input_data)
    return predictions

# Formater la réponse
def output_fn(prediction, accept='application/json'):
    """
    Formater la prédiction pour la réponse HTTP.
    """
    if accept == 'application/json':
        # Renvoyer les prédictions comme une liste JSON
        return json.dumps(prediction.tolist()), 'application/json'
    else:
        raise ValueError(f"Le type de contenu {accept} n'est pas supporté")
