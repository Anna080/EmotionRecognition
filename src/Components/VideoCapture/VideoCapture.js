import React from "react";

const VideoCapture = ({ recordedMedia }) => {
  // Vous pouvez ajouter plus de logique pour générer des graphiques ou des statistiques
  return (
    <div>
      <h3>Emotion Dashboard</h3>
      <p>Total Media: {recordedMedia.length}</p>
      {/* Vous pouvez ajouter un graphique ici */}
    </div>
  );
};

export default VideoCapture;
