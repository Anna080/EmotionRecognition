import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaImages, FaSave } from 'react-icons/fa';

const FileUploadBox = styled.div`
  border: 2px dashed #00d9bb;
  border-radius: 10px;
  width: 300px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00d9bb;
  background-color: transparent;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(0, 217, 187, 0.1);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const PreviewContainer = styled.div`
  position: relative;
  margin-top: 1rem;
  width: 300px;
  height: auto;
  text-align: center;
  border-radius: 10px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
`;

const VideoPreview = styled.video`
  width: 100%;
  height: auto;
  border-radius: 10px;
  z-index: 1; /* Set a lower z-index for video */
`;

const CanvasOverlay = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2; /* Set a higher z-index to ensure it's on top of the video */
`;

const EmotionBox = styled.div`
  position: ${(props) => (props.$isImage ? 'absolute' : 'relative')};
  top: ${(props) => (props.$isImage ? '10px' : '0')};
  left: ${(props) => (props.$isImage ? '10px' : '0')};
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 8px;
  font-size: 1rem;
  max-width: 150px;
  z-index: 3;
  margin-top: ${(props) => (props.$isImage ? '0' : '1rem')};
`;

const SaveIcon = styled(FaSave)`
  margin-top: 0.5rem;
  color: #00d9bb;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const ImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UploadCapture = ({
  callEmotionApi,
  saveRecordedMedia,
  setImgUrl,
  setFaceData,
  recordedMedia,
  fileType, 
  selectedMediaUrl,
  selectedEmotions,
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isImage, setIsImage] = useState(true);
  const [emotions, setEmotions] = useState(null);
  const [saved, setSaved] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      videoRef.current.onloadedmetadata = () => {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
      };
    }
  }, [previewUrl]);

  useEffect(() => {
    if (selectedMediaUrl) {
      setPreviewUrl(selectedMediaUrl);
      //setIsImage(selectedMediaUrl.startsWith('data:image/'));
      setSaved(false);
      setEmotions(null);

      const isImageFile =
        selectedMediaUrl.startsWith('data:image/') ||
        selectedMediaUrl.endsWith('.jpg') ||
        selectedMediaUrl.endsWith('.png') ||
        selectedMediaUrl.endsWith('.jpeg');

      const isVideoFile =
        selectedMediaUrl.startsWith('data:video/') ||
        selectedMediaUrl.endsWith('.mp4') ||
        selectedMediaUrl.endsWith('.mov') ||
        selectedMediaUrl.endsWith('.webm') ||
        selectedMediaUrl.endsWith('.ogg') ||
        selectedMediaUrl.startsWith('blob:');


      if (isImageFile) {
        const base64data = selectedMediaUrl.split(',')[1];
        if (selectedEmotions) {
          setEmotions(selectedEmotions);
          setFaceData(selectedEmotions);
          setSaved(false);
        }
        setImgUrl(selectedMediaUrl);
      }  else if (isVideoFile) {
        stopCurrentVideo();
        setIsImage(false);
        setSaved(false);
        setEmotions(null);
        setImgUrl(selectedMediaUrl);
        // La détection d'émotions se fait en direct pendant la lecture
      } else {
        console.error('Type de média inconnu pour selectedMediaUrl:', selectedMediaUrl);
      }
    }
    return () => stopCurrentVideo();
  }, [selectedMediaUrl, selectedEmotions]);


  const resizeImage = (file, maxWidth, maxHeight, callback) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height);
          width = width * scale;
          height = height * scale;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        callback(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const stopCurrentVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause(); // Arrêter la lecture
      videoRef.current.currentTime = 0; // Réinitialiser au début
    }
  };

  const handleFileChange = (event) => {
    stopCurrentVideo();
    const uploadedFile = event.target.files[0];
    setEmotions(null); // Reset emotions state
    setSaved(false); // Reset saved state for each new file

    if (uploadedFile) {
      if (uploadedFile.size > 1000 * 1024 * 1024) {
        alert('File size exceeds 100 MB. Please choose a smaller file.');
        return;
      }

      if (fileType === 'image' && !uploadedFile.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }

      if (fileType === 'video' && !uploadedFile.type.startsWith('video/')) {
        alert('Please upload a video file.');
        return;
      }

      setIsImage(fileType === 'image');

      if (fileType === 'image') {
        resizeImage(uploadedFile, 800, 800, (resizedDataUrl) => {
          const alreadyExists = recordedMedia?.some(
            (media) => media.mediaUrl === resizedDataUrl
          );

          if (alreadyExists) {
            alert('This file is already in the gallery.');
            return;
          }

          const base64data = resizedDataUrl.split(',')[1];

          callEmotionApi(base64data, (data) => {
            setFaceData(data);
            setEmotions(data);
            setSaved(false); // Ensure saved state is reset whenever new emotions are detected
          });

          setPreviewUrl(resizedDataUrl);
          setImgUrl(resizedDataUrl);
        });
      } else {
        const videoUrl = URL.createObjectURL(uploadedFile);
        setPreviewUrl(videoUrl);
        setImgUrl(videoUrl);
      }
    }
  };

  const handleVideoFrame = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = video.videoWidth;
      offscreenCanvas.height = video.videoHeight;
      const offscreenCtx = offscreenCanvas.getContext('2d');
      offscreenCtx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
      const frameData = offscreenCanvas.toDataURL('image/jpeg', 0.7).split(',')[1];

      callEmotionApi(frameData, (data) => {
        if (data && data.length > 0) {
          const firstEmotion = [data[0]]; // Sélectionne uniquement la première émotion
          setEmotions(firstEmotion);
          setSaved(false); // Reset saved state after processing each frame for video
          console.log("Detected emotions: ", firstEmotion);
          drawBoundingBoxes(firstEmotion);
        }
      });
    }
  };

  const drawBoundingBoxes = (faces) => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      faces.forEach(face => {
        const { x, y, width, height, emotion } = face;
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(emotion, x, y - 5);
      });
    }
  };

  const handleClick = () => {
    document.getElementById('file-input').click();
  };

  const handleSave = async () => {
    if (previewUrl && emotions) {
      saveRecordedMedia(previewUrl, emotions);
      setSaved(true);
      /** 
      const emotionLabel = emotions[0]?.emotion || "Neutral";
      try {
        const response = await fetch('/add_image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: isImage ? previewUrl.split(',')[1] : previewUrl,
            emotion: emotionLabel,
          }),
        });
        if (!response.ok) throw new Error('Server error');
        const result = await response.json();
        console.log(result.message);
      } catch (error) {
        console.error("Error adding image to train.csv:", error);
      }
        **/
    }
  };

  useEffect(() => {
    let interval;
    if (!isImage && previewUrl && videoRef.current) {
      interval = setInterval(handleVideoFrame, 1500); 
    }
    return () => {
      clearInterval(interval); // Nettoyage de l'interval
      stopCurrentVideo(); // Assurez-vous d'arrêter la vidéo
    };
  }, [previewUrl, isImage]);

  return (
    <div>
      <FileUploadBox onClick={handleClick}>
        <FaImages size={36} style={{ marginRight: '8px' }} />
        Sélectionner un fichier
      </FileUploadBox>
      <HiddenFileInput
        id="file-input"
        type="file"
        accept={fileType === 'image' ? 'image/*' : 'video/*'}
        onChange={handleFileChange}
      />
      {previewUrl && (
        <ImageWrapper>
          <PreviewContainer $isImage={isImage}>
            {isImage ? (
              emotions && (
                <EmotionBox $isImage={isImage}>
                  {emotions.map((emotion, index) => (
                    <p key={index}>{emotion.emotion}</p>
                  ))}
                </EmotionBox>
              )
            ) : (
              <>
                <VideoPreview ref={videoRef} src={previewUrl} controls />
                <CanvasOverlay ref={canvasRef} />
              </>
            )}
          </PreviewContainer>
          {!isImage && emotions && (
            <EmotionBox $isImage={isImage}>
              {emotions.map((emotion, index) => (
                <p key={index}>{emotion.emotion}</p>
              ))}
            </EmotionBox>
          )}
          {emotions && !saved && <SaveIcon onClick={handleSave} />}
        </ImageWrapper>
      )}
    </div>
  );
};

export default UploadCapture;
