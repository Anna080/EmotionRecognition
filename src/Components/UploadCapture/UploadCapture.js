import React, { useState, useRef } from 'react';

const UploadCapture = ({ callEmotionApi, saveRecordedMedia, setImgUrl, setFaceData, toggleRealTimeDetection }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const videoRef = useRef(null); // Référence à l'élément vidéo

  // Fonction pour traiter le fichier vidéo et extraire les frames
  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];

    if (uploadedFile && uploadedFile.type.includes('video')) {
      toggleRealTimeDetection(false); // Désactiver la détection en temps réel pour la vidéo

      const videoUrl = URL.createObjectURL(uploadedFile);
      console.log("Generated video URL: ", videoUrl); // Afficher l'URL dans la console pour vérifier
      setPreviewUrl(videoUrl); // Prévisualisation de la vidéo
      setImgUrl(videoUrl); // Mettre à jour l'URL de la vidéo
      saveRecordedMedia(videoUrl, []); // Sauvegarder la vidéo
    } else if (uploadedFile && uploadedFile.type.includes('image')) {
      // Gestion des images (comme avant)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        callEmotionApi(base64data, setFaceData);
        const imageUrl = URL.createObjectURL(uploadedFile);
        setPreviewUrl(imageUrl);
        setImgUrl(imageUrl);
        saveRecordedMedia(imageUrl, []);
        toggleRealTimeDetection(true); // Réactiver la détection en temps réel après la prédiction
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  // Fonction déclenchée lorsque les métadonnées vidéo sont chargées
  const handleLoadedMetadata = () => {
    const videoElement = videoRef.current;

    if (videoElement) {
      videoElement.play(); // Lancer la lecture de la vidéo une fois que les métadonnées sont prêtes
      processVideoFrames(); // Commencer à traiter les frames une fois la vidéo chargée
    }
  };

  // Fonction pour traiter les frames de la vidéo
  const processVideoFrames = () => {
    const videoElement = videoRef.current;
    
    if (!videoElement) {
      console.error('L\'élément vidéo n\'est pas encore prêt');
      return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const processFrame = () => {
      if (!videoElement.paused && !videoElement.ended) {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        // Dessiner la frame de la vidéo sur le canvas
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Obtenir les données de la frame en base64
        const base64Frame = canvas.toDataURL('image/jpeg').split(',')[1];

        // Envoyer la frame pour prédiction des émotions
        callEmotionApi(base64Frame, setFaceData);

        // Continuer à traiter les frames toutes les 500 ms
        setTimeout(processFrame, 500);
      }
    };

    processFrame(); // Démarrer le traitement des frames
  };

  return (
    <div>
      <h3>Upload Image or Video</h3>
      <input type="file" accept="image/*, video/*" onChange={handleFileChange} />
      {previewUrl && (
        <div>
          <h4>Preview:</h4>
          {previewUrl.includes('video') ? (
            <video
              ref={videoRef}  // Assurez-vous que le ref est bien attaché
              src={previewUrl}  // Utilisez previewUrl pour définir le src de la vidéo
              controls  // Ajouter des contrôles pour la vidéo
              onLoadedMetadata={handleLoadedMetadata} // S'assurer que les métadonnées sont chargées avant de jouer
              style={{ width: '300px' }}  // Ajuster la taille de la vidéo si nécessaire
            />
          ) : (
            <img src={previewUrl} alt="Uploaded Preview" style={{ width: '300px' }} />
          )}
        </div>
      )}
    </div>
  );
};

export default UploadCapture;
