import React, { useState } from 'react';
import styled from 'styled-components';
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const DashboardWrapper = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0px 4px 30px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  color: white;
`;

const VideoList = styled.ul`
  list-style: none;
  padding: 0;
`;

const VideoItem = styled.li`
  cursor: pointer;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: rgba(0, 217, 187, 0.2);
  border-radius: 10px;
  &:hover {
    background: rgba(0, 217, 187, 0.3);
  }
`;

const ChartContainer = styled.div`
  margin-top: 2rem;
`;

const Dashboard = ({ recordedMedia, userId }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const userVideos = recordedMedia.filter(
    (media) => media.type === 'video' && media.userId === userId
  );

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  const processEmotionData = (video) => {
    const emotionCounts = {};
    const emotionTimeline = {};
    const emotionIntensity = {};

    video.emotions.forEach((entry) => {
      const time = parseFloat(entry.time.toFixed(2)); // Arrondir le temps à 2 décimales
      entry.emotions.forEach((emotionData) => {
        const emotion = emotionData.emotion;
        const confidence = emotionData.confidence || 1; // Si la confiance n'est pas fournie, utiliser 1

        // Compter les émotions totales
        if (emotionCounts[emotion]) {
          emotionCounts[emotion] += 1;
        } else {
          emotionCounts[emotion] = 1;
        }

        // Enregistrer les émotions au fil du temps
        if (emotionTimeline[time]) {
          if (emotionTimeline[time][emotion]) {
            emotionTimeline[time][emotion] += 1;
          } else {
            emotionTimeline[time][emotion] = 1;
          }
        } else {
          emotionTimeline[time] = { [emotion]: 1 };
        }

        // Enregistrer l'intensité des émotions
        if (emotionIntensity[emotion]) {
          emotionIntensity[emotion].push({ time, confidence });
        } else {
          emotionIntensity[emotion] = [{ time, confidence }];
        }
      });
    });

    return { emotionCounts, emotionTimeline, emotionIntensity };
  };

  const renderCharts = (video) => {
    const { emotionCounts, emotionTimeline, emotionIntensity } = processEmotionData(video);

    // Préparer les données pour le graphique circulaire (Camembert)
    const pieData = {
      labels: Object.keys(emotionCounts),
      datasets: [
        {
          data: Object.values(emotionCounts),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#FFCD56',
          ],
        },
      ],
    };

    // Préparer les données pour le graphique en lignes (Évolution des émotions)
    const times = Object.keys(emotionTimeline);
    const lineDatasets = Object.keys(emotionCounts).map((emotion, index) => ({
      label: emotion,
      data: times.map((time) => emotionTimeline[time][emotion] || 0),
      fill: false,
      borderColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FFCD56',
      ][index % 7],
    }));

    const lineData = {
      labels: times,
      datasets: lineDatasets,
    };

    // Préparer les données pour l'histogramme (Distribution des émotions)
    const barData = {
      labels: Object.keys(emotionCounts),
      datasets: [
        {
          label: "Nombre d'occurrences",
          data: Object.values(emotionCounts),
          backgroundColor: '#36A2EB',
        },
      ],
    };

    // Préparer les données pour le graphique d'intensité des émotions
    const intensityDatasets = Object.keys(emotionIntensity).map((emotion, index) => ({
      label: emotion,
      data: emotionIntensity[emotion].map((data) => ({ x: data.time, y: data.confidence })),
      fill: false,
      borderColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FFCD56',
      ][index % 7],
      showLine: true,
    }));

    const intensityData = {
      datasets: intensityDatasets,
    };

    return (
      <div>
        <h4>Répartition des émotions (Camembert)</h4>
        <Pie data={pieData} />

        <h4>Évolution des émotions au cours du temps (Graphique en lignes)</h4>
        <Line data={lineData} />

        <h4>Distribution des émotions (Histogramme)</h4>
        <Bar data={barData} />

        <h4>Intensité des émotions au cours du temps (Graphique en points)</h4>
        <Line data={intensityData} options={{ scales: { x: { type: 'linear', position: 'bottom' } } }} />
      </div>
    );
  };

  return (
    <DashboardWrapper>
      <h2>Tableau de bord des vidéos</h2>
      {userVideos.length === 0 ? (
        <p>Aucune vidéo disponible dans la galerie.</p>
      ) : (
        <div>
          <h3>Sélectionnez une vidéo :</h3>
          <VideoList>
            {userVideos.map((video, index) => (
              <VideoItem key={index} onClick={() => handleVideoSelect(video)}>
                {`Vidéo ${index + 1} - ${new Date(video.timestamp).toLocaleString()}`}
              </VideoItem>
            ))}
          </VideoList>
        </div>
      )}
      {selectedVideo && (
        <ChartContainer>
          <h3>Tableau de bord pour la vidéo sélectionnée</h3>
          {renderCharts(selectedVideo)}
        </ChartContainer>
      )}
    </DashboardWrapper>
  );
};

export default Dashboard;
