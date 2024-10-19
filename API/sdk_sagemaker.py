import sagemaker
from sagemaker.tensorflow import TensorFlowModel
import boto3
import pandas as pd
import numpy as np

# Paramètres de configuration
bucket_name = 'model-emotiondetection-deployment'
model_path = 's3://{}/model.tar.gz'.format(bucket_name)
role = 'SageMakerExecutionRole'

# Créer une session Boto3 avec la région 'eu-west-1' (Irlande)
boto_sess = boto3.Session(region_name="eu-west-1")

# Créer un client SageMaker avec la région spécifiée
sagemaker_session = sagemaker.Session(boto_session=boto_sess)

# Définir le modèle TensorFlow
tensorflow_model = TensorFlowModel(
    model_data=model_path,
    role=role,
    framework_version='2.16.1', 
    entry_point='inference.py',  
    sagemaker_session=sagemaker_session
)

# Activer les logs CloudWatch
log_config = {
    "EnableCloudWatchMetrics": True,  # Active les métriques CloudWatch
    "EnableCapture": True,
    "CaptureContentTypeHeader": {"CsvContentTypes": ["text/csv"], "JsonContentTypes": ["application/json"]}
}

# Supprimer la configuration de point de terminaison s'il existe encore
sagemaker_session.delete_endpoint_config('tensorflow-inference-endpoint')


# Déployer le modèle avec journalisation activée
predictor = tensorflow_model.deploy(
    initial_instance_count=1,
    instance_type='ml.m5.large',  # Utilisez une instance CPU
    endpoint_name='tensorflow-inference-endpoint',  # Nom du point de terminaison
    enable_cloudwatch_metrics=True,
    wait=True  # Attendre la création complète du point de terminaison
)

# Fonction pour prétraiter les pixels de l'image
def preprocess_pixels(data):
    images = data['pixels'].str.split(" ").tolist()
    images = np.array(images, dtype='float32')
    images = images.reshape(-1, picture_size, picture_size, 1)
    images /= 255.0  # Normaliser les valeurs des pixels entre 0 et 1
    return images

# Chargement des données de test
test_data = pd.read_csv('./fer2013/test.csv')

# Préparation des images de test
X_test = preprocess_pixels(test_data)

# Faire des prédictions
y_pred = predictor.predict(X_test)

# Obtenir les émotions prédites
predicted_emotions = np.argmax(y_pred, axis=1)
print(predicted_emotions)