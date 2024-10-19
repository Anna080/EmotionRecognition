import React, { useRef, useEffect, useState } from "react";
import "./FaceDetect.css";

const FaceDetect = ({ boxes, imgUrl }) => {
  const imageRef = useRef(null);
  const [faceBoxes, setFaceBoxes] = useState([]);

  const calculateFaceLocations = () => {
    if (!boxes || boxes.length === 0 || !imageRef.current) {
      setFaceBoxes([]);
      return;
    }

    const width = imageRef.current.width;
    const height = imageRef.current.height;

    const calculatedBoxes = boxes.map((face) => {
      return {
        leftCol: face.box.x,
        topRow: face.box.y,
        rightCol: width - face.box.x - face.box.w,
        bottomRow: height - face.box.y - face.box.h,
        emotion: face.emotion,
      };
    });

    setFaceBoxes(calculatedBoxes);
  };

  useEffect(() => {
    calculateFaceLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boxes]);

  return (
    <div className="center">
      <div className="absolute mt2">
        <img
          id="InputImage"
          ref={imageRef}
          className="white bw2 w-500 h-50 br2"
          alt="faces"
          src={imgUrl}
          width="auto"
          height="auto"
          onLoad={calculateFaceLocations}
        />
        {faceBoxes.map((box, i) => (
          <div key={i}>
            <div
              className="bounding-box"
              style={{
                top: box.topRow,
                right: box.rightCol,
                bottom: box.bottomRow,
                left: box.leftCol,
              }}
            ></div>
            <div
              className="emotion-label"
              style={{
                top: box.topRow - 20,
                left: box.leftCol,
              }}
            >
              {box.emotion}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaceDetect;