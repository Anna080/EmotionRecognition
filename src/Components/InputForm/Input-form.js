import React, { useState, useRef } from 'react';
import ReactWebcam from 'react-webcam';

const InputForm = ({ onButtonClick, onChangeInput, mode }) => {
  const [useWebcam, setUseWebcam] = useState(false);
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    onChangeInput({ target: { value: imageSrc } });
  };

  return (
    <div>
      <p className="f3">
        {mode === "face-detection"
          ? "This Magic Brain will detect faces in your pictures. Give it a try."
          : "This Magic Brain will detect emotions in faces. Try it now."}
      </p>
      <div className="center">
        <div className="form center pa4 br3 shadow-5">
          {useWebcam ? (
            <div>
              <ReactWebcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width={500} />
              <button onClick={capture} className="w-30 grow f4 link ph3 pv2 dib white bg-light-purple">
                Capture
              </button>
            </div>
          ) : (
            <input
              className="f4 pa2 w-70 center"
              type="text"
              onChange={onChangeInput}
              placeholder="Enter image URL"
            />
          )}
          <button className="w-30 grow f4 link ph3 pv2 dib white bg-light-purple" onClick={onButtonClick}>
            Detect
          </button>
        </div>
      </div>
      <div className="center">
        <button
          onClick={() => setUseWebcam(!useWebcam)}
          className="f6 link dim br3 ph3 pv2 mb2 dib white bg-dark-blue"
        >
          {useWebcam ? "Use URL Input" : "Use Webcam"}
        </button>
      </div>
    </div>
  );
};

export default InputForm;