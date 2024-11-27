import React from "react";
import styled from "styled-components";

const EmotionBox = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 8px;
  font-size: 1rem;
  max-width: 150px;
  z-index: 1;
`;

const EmotionDetectWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const EmotionDetect = ({ emotions, imgUrl }) => {
  return (
    <EmotionDetectWrapper>
      {imgUrl && <img src={imgUrl} alt="Emotion Detection" width="300px" />}
      {imgUrl && emotions.length > 0 && (
        <EmotionBox>
          {emotions.map((emotion, index) => (
            <p key={index}>{emotion.emotion}</p>
          ))}
        </EmotionBox>
      )}
    </EmotionDetectWrapper>
  );
};

export default EmotionDetect;
