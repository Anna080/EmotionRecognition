import React from 'react';

const Navigation = ({ signedIn, onRouteChange, onModeChange }) => {
  if (signedIn) {
    return (
      <nav style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <p onClick={() => onModeChange('face-detection')} className="f3 link dim black underline pa3 pointer">
            Face Detection
          </p>
          <p onClick={() => onModeChange('emotion-detection')} className="f3 link dim black underline pa3 pointer">
            Emotion Detection
          </p>
        </div>
        <p onClick={() => onRouteChange('signin')} className="f3 link dim black underline pa3 pointer">
          Sign Out
        </p>
      </nav>
    );
  } else {
    return (
      <nav style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <p onClick={() => onRouteChange('signin')} className="f3 link dim black underline pa3 pointer">
          Sign In
        </p>
        <p onClick={() => onRouteChange('register')} className="f3 link dim black underline pa3 pointer">
          Register
        </p>
      </nav>
    );
  }
};

export default Navigation;