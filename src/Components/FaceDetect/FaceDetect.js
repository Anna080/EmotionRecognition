import React from 'react';
import './FaceDetect.css';

const FaceDetect = ({ imgUrl, boxes }) => {
  return (
    <div className="center">
      <div className="relative mt2">
        <img id="InputImage" className="white bw2 w-500 h-50 br2" alt="faces" src={imgUrl} width="auto" height="auto" />
        {boxes.map((box, index) => (
          <div
            key={index}
            className="bound_box"
            style={{
              top: box.topRow,
              right: box.rightCol,
              left: box.leftCol,
              bottom: box.bottomRow,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default FaceDetect;
