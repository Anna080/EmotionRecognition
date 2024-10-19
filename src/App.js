import React, { Component } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import Navigation from "./Components/Navigation";
import Logo from "./Components/Logo";
import Rank from "./Components/Rank";
import EmotionDetect from "./Components/EmotionDetect/EmotionDetect";
import WebcamCapture from "./Components/WebcamCapture/WebcamCapture";
import UploadCapture from "./Components/UploadCapture/UploadCapture";
import SignIn from "./Components/SignIn/SignIn"; // Importer SignIn
import Register from "./Components/Register/Register"; // Importer Register
import Dashboard from "./Components/Dashboard/Dashboard";
import RecordedMedia from "./Components/RecordedMedia/RecordedMedia";
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
  route: "signin", // Débuter sur la page de connexion
  signedIn: false,
  recordedMedia: [],
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: "",
  },
  // Separate states for webcam and upload
  webcamEmotions: [], // Émotions détectées par la webcam
  webcamImgUrl: "",   // Image capturée par la webcam
  uploadEmotions: [], // Émotions pour les images uploadées
  uploadImgUrl: "",   // Image ou vidéo uploadée
};

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
  width: 100%;
  max-width: 700px;
  min-height: 600px;
  margin: 3rem auto;
  padding: 3rem;
  background: rgba(0, 217, 187, 0.2);
  border-radius: 20px;
  box-shadow: 0px 8px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

class App extends Component {
  constructor() {
    super();
    this.state = {
      ...initialState,
      realTimeDetection: true, // Contrôle pour la détection en temps réel
    };
  }

  // Cette méthode permet de mettre à jour l'utilisateur dans l'état
  loadUser = (userData) => {
    this.setState({
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        entries: userData.entries,
        joined: userData.joined,
      },
      signedIn: true, // Utilisateur connecté
    });
  };

  // Fonction pour enregistrer un média avec les émotions détectées
  saveRecordedMedia = (mediaUrl, emotions) => {
    const { recordedMedia } = this.state;
    const newMedia = {
      mediaUrl,
      emotions,
      timestamp: new Date().toLocaleString(),
    };
    this.setState({ recordedMedia: [...recordedMedia, newMedia] });
  };

  // API pour envoyer les données des images/vidéos
  callEmotionApi = (base64data, setFaceData) => {
    fetch("http://localhost:5030/predict", {
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
          setFaceData([]); // Réinitialiser en cas d'erreur
        } else if (Array.isArray(data)) {
          setFaceData(data); // Mettre à jour les prédictions
        } else {
          console.error("Unexpected response:", data);
          setFaceData([]); // Réinitialiser en cas de réponse inattendue
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setFaceData([]); // Réinitialiser en cas d'erreur
      });
  };

  // Met à jour les émotions et l'URL pour la webcam
  setWebcamFaceData = (data) => {
    this.setState({ webcamEmotions: data });
  };

  setWebcamImgUrl = (url) => {
    this.setState({ webcamImgUrl: url });
  };

  // Met à jour les émotions et l'URL pour les uploads
  setUploadFaceData = (data) => {
    this.setState({ uploadEmotions: data });
  };

  setUploadImgUrl = (url) => {
    this.setState({ uploadImgUrl: url });
  };

  // Fonction pour arrêter ou reprendre la détection en temps réel
  toggleRealTimeDetection = (status) => {
    this.setState({ realTimeDetection: status });
  };

  // Changement de route
  onRouteChange = (route) => {
    this.setState({ route: route });
  };

  render() {
    const {
      signedIn,
      route,
      webcamImgUrl,
      webcamEmotions,
      uploadImgUrl,
      uploadEmotions,
      recordedMedia,
      realTimeDetection,
    } = this.state;

    return (
      <AppWrapper>
        <Particles params={particlesOpt} />
        <Navigation signedIn={signedIn} onRouteChange={this.onRouteChange} />
        {route === "home" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ContentWrapper>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries} />
              <WebcamCapture
                callEmotionApi={this.callEmotionApi}
                saveRecordedMedia={this.saveRecordedMedia}
                setFaceData={this.setWebcamFaceData}
                setImgUrl={this.setWebcamImgUrl}
                realTimeDetection={realTimeDetection} // Contrôle du temps réel
              />
              <UploadCapture
                callEmotionApi={this.callEmotionApi}
                saveRecordedMedia={this.saveRecordedMedia}
                setImgUrl={this.setUploadImgUrl}
                setFaceData={this.setUploadFaceData}
                toggleRealTimeDetection={this.toggleRealTimeDetection} // Contrôle du temps réel pour l'upload
              />
              {/* Affichage pour les captures de la webcam */}
              <EmotionDetect emotions={webcamEmotions} imgUrl={webcamImgUrl} />
              {/* Affichage pour les images ou vidéos uploadées */}
              <EmotionDetect emotions={uploadEmotions} imgUrl={uploadImgUrl} />
            </ContentWrapper>
          </motion.div>
        ) : route === "dashboard" ? (
          <Dashboard recordedMedia={recordedMedia} />
        ) : route === "media" ? (
          <RecordedMedia recordedMedia={recordedMedia} />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AuthWrapper>
              {/* Route de connexion */}
              {route === "signin" ? (
                <SignIn loadUser={this.loadUser} homeScreen={this.onRouteChange} />
              ) : (
                <Register loadUser={this.loadUser} homeScreen={this.onRouteChange} />
              )}
            </AuthWrapper>
          </motion.div>
        )}
      </AppWrapper>
    );
  }
}

export default App;
