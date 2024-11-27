import React, { useRef, useEffect, useState } from "react";

const WebcamCapture = ({ callEmotionApi }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [emotion, setEmotion] = useState(""); // Émotion détectée
  const [faceBox, setFaceBox] = useState(null); // Coordonnées du visage
  const [isRealTime, setIsRealTime] = useState(true); // Contrôle temps réel
  const animationFrameRef = useRef(null); // Pour requestAnimationFrame

  useEffect(() => {
    // Accès à la webcam avec une résolution réduite
    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480 } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Erreur lors de l'accès à la webcam :", err);
      });

    let predictionInterval;
    if (isRealTime) {
      predictionInterval = setInterval(() => {
        captureAndPredict();
      }, 500); // Ajuster à une fréquence raisonnable
    }

    return () => {
      if (predictionInterval) clearInterval(predictionInterval);

      // Arrêter les flux de la webcam
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }

      // Annuler l'animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRealTime]);

  // Fonction pour capturer une image et effectuer une prédiction
  const captureAndPredict = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    // S'assurer que le canvas et la vidéo sont valides
    if (!canvas || !video) return;

    canvas.width = 640;
    canvas.height = 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir en base64
    const imageDataURL = canvas.toDataURL("image/jpeg");
    const base64Image = imageDataURL.split(",")[1];

    // Appeler l'API pour prédire
    callEmotionApi(base64Image, (result) => {
      if (result && result.length > 0) {
        const face = result[0];
        setFaceBox(face.box); // Mettre à jour les coordonnées du cadre
        setEmotion(face.emotion); // Mettre à jour l'émotion
      } else {
        setFaceBox(null); // Aucun visage détecté
        setEmotion("");
      }
    });
  };

  // Utiliser requestAnimationFrame pour dessiner le cadre
  const drawOverlay = () => {
    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext("2d") : null;

    if (ctx) {
      // Effacer le canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (faceBox) {
        // Dessiner le cadre autour du visage
        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 2;
        ctx.strokeRect(faceBox.x, faceBox.y, faceBox.w, faceBox.h);

        // Dessiner le texte de l'émotion
        ctx.font = "16px Arial";
        ctx.fillStyle = "#00FF00";
        ctx.fillText(emotion, faceBox.x, faceBox.y - 10);
      }
    }

    // Boucle d'animation
    animationFrameRef.current = requestAnimationFrame(drawOverlay);
  };

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(drawOverlay);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [faceBox, emotion]);

  return (
    <div style={{ position: "relative", width: "640px", height: "480px" }}>
      <h2>Détection d'Émotions via Webcam</h2>
      {/* Vidéo webcam */}
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{
          width: "640px",
          height: "480px",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
      {/* Canvas pour overlay */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "640px",
          height: "480px",
        }}
      />
    </div>
  );
};

export default WebcamCapture;
