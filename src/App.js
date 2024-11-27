import React, { Component } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import Navigation from "./Components/Navigation";
import Logo from "./Components/Logo";
import EmotionDetect from "./Components/EmotionDetect/EmotionDetect";
import WebcamCapture from "./Components/WebcamCapture/WebcamCapture";
import UploadCapture from "./Components/UploadCapture/UploadCapture";
import SignIn from "./Components/SignIn/SignIn";
import Register from "./Components/Register/Register";
import Dashboard from "./Components/Dashboard/Dashboard";
import VideoCapture from "./Components/VideoCapture/VideoCapture";
import "./App.css";

const particlesOpt = {
  particles: {
    number: { value: 40 },
    color: { value: "#fff" },
    size: { value: 3 },
    move: { speed: 2 },
    line_linked: {
      color: "#00d9bb",
      opacity: 0.4,
    },
  },
};

const initialState = {
  input: "",
  route: "signin",
  signedIn: false,
  recordedMedia: [],
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: "",
  },
  webcamEmotions: [],
  webcamImgUrl: "",
  imgEmotions: [],
  imgUploadUrl: "",
  videoEmotions: [],
  videoUploadUrl: "",
};

// Styled components

const AppWrapper = styled.div`
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
`;

const ContentWrapper = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0px 4px 30px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
`;

const AuthWrapper = styled.div`
  width: auto;
  min-width: 300px;
  padding: 3rem;
  background: rgba(0, 217, 187, 0.2);
  border-radius: 20px;
  box-shadow: 0px 8px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: visible;
`;

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2rem;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  width: 200px;
  height: 150px;
  margin: 1rem;
  padding: 1rem;
  color: white;
  cursor: pointer;
  box-shadow: 0px 4px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  text-align: center;
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const GalleryContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
`;

const ImageCard = styled.div`
  width: 150px;
  height: 150px;
  position: relative;
  border: 3px solid #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.05);
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DateHeading = styled.h3`
  width: 100%;
  text-align: left;
  font-size: 1rem;
  font-weight: 600;
  color: #ccc;
  margin-top: 1.5rem;
  padding-left: 1rem;
  border-bottom: 1px solid #ccc;
`;

const EmotionBox = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 0.8rem;
  max-width: 90%;
  overflow-wrap: break-word;
`;

// Component definitions

const Cards = ({ onRouteChange }) => (
  <CardGrid>
    <Card onClick={() => onRouteChange("realtime")}>Realtime</Card>
    <Card onClick={() => onRouteChange("images")}>Images</Card>
    <Card onClick={() => onRouteChange("videos")}>Videos</Card>
  </CardGrid>
);

const Realtime = ({
  callEmotionApi,
  saveRecordedMedia,
  setWebcamFaceData,
  setWebcamImgUrl,
  realTimeDetection,
  webcamEmotions,
  webcamImgUrl,
}) => (
  <ContentWrapper>
    <WebcamCapture
      callEmotionApi={callEmotionApi}
      saveRecordedMedia={(url, emotions) => saveRecordedMedia(url, emotions, "realtime")}
      setFaceData={setWebcamFaceData}
      setImgUrl={setWebcamImgUrl}
      realTimeDetection={realTimeDetection}
    />
   
  </ContentWrapper>
);

const Images = ({
  callEmotionApi,
  saveRecordedMedia,
  setImgEmotions,
  setImgUploadUrl,
  imgEmotions,
  imgUploadUrl,
  recordedMedia,
  toggleRealTimeDetection,
  userId,
  handleMediaSelect,
  selectedMediaUrl,
  selectedEmotions,
}) => {
  const userImages = recordedMedia
    .filter((media) => media.type === "image" && media.userId === userId)
    .reduce((acc, media) => {
      const date = new Date(media.timestamp).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(media);
      return acc;
    }, {});

  return (
    <ContentWrapper>
      <UploadCapture
        selectedMediaUrl={selectedMediaUrl}
        selectedEmotions={selectedEmotions}
        callEmotionApi={callEmotionApi}
        saveRecordedMedia={(url, emotions) => saveRecordedMedia(url, emotions, "image")}
        setImgUrl={setImgUploadUrl}
        setFaceData={setImgEmotions}
        recordedMedia={recordedMedia}
        toggleRealTimeDetection={toggleRealTimeDetection}
        fileType="image" // Restrict to images
      />
      <EmotionDetect emotions={imgEmotions} imgUrl={imgUploadUrl} />
      <h2>Gallery</h2>
      {Object.keys(userImages).map((date) => (
        <div key={date}>
          <DateHeading>{date}</DateHeading>
          <GalleryContainer>
            {userImages[date].map((media, index) => (
              <ImageCard key={index} onClick={() => handleMediaSelect(media.mediaUrl, media.emotions)}>
                <StyledImage src={media.mediaUrl} alt={`Saved ${index}`} />
                <EmotionBox>
                  {media.emotions.map((emotion, i) => (
                    <div key={i}>{emotion.emotion}</div>
                  ))}
                </EmotionBox>
              </ImageCard>
            ))}
          </GalleryContainer>
        </div>
      ))}
    </ContentWrapper>
  );
};

const Videos = ({
  callEmotionApi,
  saveRecordedMedia,
  setVideoEmotions,
  setVideoUploadUrl,
  videoEmotions,
  videoUploadUrl,
  recordedMedia,
  userId,
  toggleRealTimeDetection,
  handleMediaSelect,
  selectedMediaUrl,
}) => {
  const userVideos = recordedMedia
    .filter((media) => media.type === "video" && media.userId === userId)
    .reduce((acc, media) => {
      const date = new Date(media.timestamp).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(media);
      return acc;
    }, {});

  return (
    <ContentWrapper>
      <UploadCapture
        callEmotionApi={callEmotionApi}
        saveRecordedMedia={(url, emotions) => saveRecordedMedia(url, emotions, "video")}
        setImgUrl={setVideoUploadUrl}
        setFaceData={setVideoEmotions}
        toggleRealTimeDetection={toggleRealTimeDetection}
        fileType="video" // Restrict to videos
      />
    
      <h2>Uploaded Videos</h2>
      {Object.keys(userVideos).map((date) => (
        <div key={date}>
          <DateHeading>{date}</DateHeading>
          <GalleryContainer>
            {userVideos[date].map((media, index) => (
              <div key={index} onClick={() => handleMediaSelect(media.mediaUrl)}>
                <video src={media.mediaUrl} controls width="250" />
                <EmotionBox>
                  {media.emotions.map((emotion, idx) => (
                    <div key={idx}>{emotion.emotion}</div>
                  ))}
                </EmotionBox>
              </div>
            ))}
          </GalleryContainer>
        </div>
      ))}
    </ContentWrapper>
  );
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      ...initialState,
      realTimeDetection: true,
      selectedMediaUrl: "",
      selectedEmotions: null,
    };
  }

  handleMediaSelect = (mediaUrl, emotions) => {
    this.setState({ selectedMediaUrl: mediaUrl, selectedEmotions: emotions });
  };

  loadUser = (userData) => {
    this.setState({
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        entries: userData.entries,
        joined: userData.joined,
      },
      signedIn: true,
    });
  };

  saveRecordedMedia = (mediaUrl, emotions, type) => {
    const { recordedMedia, user } = this.state;
    const newMedia = {
      mediaUrl,
      emotions,
      timestamp: new Date().toISOString(),
      type,
      userId: user.id,
    };
    this.setState({ recordedMedia: [...recordedMedia, newMedia] });
  };

  callEmotionApi = (base64data, setFaceData) => {
    fetch("http://3.232.24.124/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: base64data,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          console.error("Server error:", data.message);
          setFaceData([]);
        } else if (Array.isArray(data)) {
          setFaceData(data);
        } else {
          console.error("Unexpected response:", data);
          setFaceData([]);
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setFaceData([]);
      });
  };

  setWebcamFaceData = (data) => {
    this.setState({ webcamEmotions: data });
  };

  setWebcamImgUrl = (url) => {
    this.setState({ webcamImgUrl: url });
  };

  setImgEmotions = (data) => {
    this.setState({ imgEmotions: data });
  };

  setImgUploadUrl = (url) => {
    this.setState({ imgUploadUrl: url });
  };

  setVideoEmotions = (data) => {
    this.setState({ videoEmotions: data });
  };

  setVideoUploadUrl = (url) => {
    this.setState({ videoUploadUrl: url });
  };

  toggleRealTimeDetection = (status) => {
    this.setState({ realTimeDetection: status });
  };

  onRouteChange = (route) => {
    this.setState({ route });
    if (route === "signin" || route === "register") {
      this.setState({ signedIn: false });
    }
  };

  render() {
    const {
      signedIn,
      route,
      webcamImgUrl,
      webcamEmotions,
      imgUploadUrl,
      imgEmotions,
      videoUploadUrl,
      videoEmotions,
      recordedMedia,
      realTimeDetection,
      user,
      selectedMediaUrl,
      selectedEmotions,
    } = this.state;

    return (
      <AppWrapper>
        <Particles params={particlesOpt} />
        <Navigation signedIn={signedIn} onRouteChange={this.onRouteChange} route={route} />
        {route === "home" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ContentWrapper>
              <Logo />
              <Cards onRouteChange={this.onRouteChange} />
            </ContentWrapper>
          </motion.div>
        ) : route === "realtime" ? (
          <Realtime
            callEmotionApi={this.callEmotionApi}
            saveRecordedMedia={this.saveRecordedMedia}
            setWebcamFaceData={this.setWebcamFaceData}
            setWebcamImgUrl={this.setWebcamImgUrl}
            realTimeDetection={realTimeDetection}
            webcamEmotions={webcamEmotions}
            webcamImgUrl={webcamImgUrl}
          />
        ) : route === "images" ? (
          <Images
            handleMediaSelect={this.handleMediaSelect}
            callEmotionApi={this.callEmotionApi}
            saveRecordedMedia={this.saveRecordedMedia}
            setImgEmotions={this.setImgEmotions}
            setImgUploadUrl={this.setImgUploadUrl}
            imgEmotions={imgEmotions}
            imgUploadUrl={imgUploadUrl}
            recordedMedia={recordedMedia}
            toggleRealTimeDetection={this.toggleRealTimeDetection}
            userId={user.id}
            selectedMediaUrl={selectedMediaUrl}
            selectedEmotions={selectedEmotions}
          />
        ) : route === "videos" ? (
          <Videos
            callEmotionApi={this.callEmotionApi}
            saveRecordedMedia={this.saveRecordedMedia}
            setVideoEmotions={this.setVideoEmotions}
            setVideoUploadUrl={this.setVideoUploadUrl}
            videoEmotions={videoEmotions}
            videoUploadUrl={videoUploadUrl}
            recordedMedia={recordedMedia}
            toggleRealTimeDetection={this.toggleRealTimeDetection}
            userId={user.id}
            handleMediaSelect={this.handleMediaSelect}
            selectedMediaUrl={selectedMediaUrl}
          />
        ) : route === "dashboard" ? (
          <Dashboard recordedMedia={recordedMedia} />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AuthWrapper>
              {route === "signin" ? (
                <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              ) : (
                <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              )}
            </AuthWrapper>
          </motion.div>
        )}
      </AppWrapper>
    );
  }
}

export default App;
