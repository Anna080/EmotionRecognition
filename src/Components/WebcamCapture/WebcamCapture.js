import React, { useRef, useEffect, useState } from "react";

const WebcamCapture = ({ callEmotionApi }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [emotion, setEmotion] = useState(''); // État pour l'émotion actuelle
  const [faceBox, setFaceBox] = useState(null); // État pour stocker les coordonnées du visage
  const [isRealTime, setIsRealTime] = useState(true); // Pour activer/désactiver la prédiction en temps réel

  useEffect(() => {
    // Accéder à la webcam
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error("Erreur lors de l'accès à la webcam :", err);
      });

    // Démarrer la prédiction en temps réel
    const intervalId = setInterval(() => {
      if (isRealTime) {
        captureAndPredict();
      }
    }, 500); // Capturer et prédire toutes les 500 ms

    // Nettoyage de l'intervalle à la fin du composant
    return () => {
      clearInterval(intervalId);
    };
  }, [isRealTime]);

  // Fonction pour capturer l'image et prédire
  const captureAndPredict = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Obtenir les données de l'image capturée en base64
    const imageDataURL = canvas.toDataURL("image/jpeg");
    const base64Image = imageDataURL.split(",")[1]; // Extraire l'image encodée en base64

    // Envoyer l'image encodée en base64 à l'API Flask pour la prédiction
    callEmotionApi(base64Image, (result) => {
      if (result.length > 0) {
        const face = result[0]; // On prend uniquement le premier visage
        setFaceBox(face.box); // Mettre à jour la position du cadre du visage
        setEmotion(face.emotion); // Mettre à jour l'émotion détectée
      }
    });
  };

  // Fonction pour capturer une image manuellement
  const captureImage = () => {
    setIsRealTime(false); // Désactiver la prédiction en temps réel pendant la capture manuelle
    captureAndPredict();  // Capturer et prédire manuellement
    setTimeout(() => setIsRealTime(true), 1000); // Reprendre la prédiction en temps réel après 1 seconde
  };

  return (
    <div style={{ position: "relative", width: "640px", height: "480px" }}>
      <h2>Détection d'Émotions via Webcam (Temps réel)</h2>
      {/* La vidéo de la webcam */}
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: "640px", height: "480px", position: "absolute", top: 0, left: 0 }}
      />
      {/* Le canvas pour dessiner le cadre et l'émotion */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0, width: "640px", height: "480px" }}
      />
      {/* Afficher l'émotion détectée et le cadre autour du visage */}
      {faceBox && (
        <div
          style={{
            position: "absolute",
            top: faceBox.y,
            left: faceBox.x,
            width: faceBox.w,
            height: faceBox.h,
            border: "2px solid #00FF00",
            pointerEvents: "none",
          }}
        >
          {/* Le texte de l'émotion est ajouté sous le cadre */}
          <span
            style={{
              color: "#00FF00",
              fontSize: "18px",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              padding: "2px",
              position: "absolute",
              top: "-25px",
              left: "0",
            }}
          >
            {emotion}
          </span>
        </div>
      )}
      <button onClick={captureImage} style={{ marginTop: "10px" }}>
        Capturer et Prédire
      </button>
    </div>
  );
};

export default WebcamCapture;