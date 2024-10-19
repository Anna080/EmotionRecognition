import React from "react";

const RecordedMedia = ({ recordedMedia }) => {
  return (
    <div>
      <h3>Recorded Media</h3>
      {recordedMedia.length > 0 ? (
        recordedMedia.map((media, index) => (
          <div key={index}>
            <p>{media.timestamp}</p>
            <p>Emotions: {media.emotions.join(", ")}</p>
            <video src={media.mediaUrl} controls width="300" />
          </div>
        ))
      ) : (
        <p>No media recorded yetÒ.</p>
      )}
    </div>
  );
};

export default RecordedMedia;
