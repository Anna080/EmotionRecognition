import React from "react";

const EmotionDetect = ({ emotions }) => {
  return (
    <div>
      <h3>Émotions Détectées :</h3>
      {emotions.length > 0 ? (
        emotions.map((emotion, index) => (
          <div key={index}>
            <p>Émotion : {emotion.emotion}</p>
            <p>Position : x={emotion.box.x}, y={emotion.box.y}</p>
          </div>
        ))
      ) : (
        <p>Aucune émotion détectée</p>
      )}
    </div>
  );
};

export default EmotionDetect;