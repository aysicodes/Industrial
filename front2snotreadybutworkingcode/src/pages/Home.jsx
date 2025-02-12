import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const Home = () => {
  const navigate = useNavigate();
  const [selectedCourses, setSelectedCourses] = useState({});
  const [courseScores, setCourseScores] = useState({});

  const handleCourseSelect = (boxIndex, course) => {
    setSelectedCourses({ ...selectedCourses, [boxIndex]: course });
  };

  const handleScoreChange = (boxIndex, value) => {
    setCourseScores({ ...courseScores, [boxIndex]: value });
  };

  const calculateCompetencyScores = () => {
    if (Object.keys(selectedCourses).length === 0) return { labels: [], datasets: [] };

    const sharedScore = Object.values(courseScores).length > 0 
      ? Object.values(courseScores).reduce((sum, score) => sum + Number(score), 0) / Object.values(courseScores).length
      : 0;

    const uniqueCompetencyScores = Object.entries(selectedCourses).flatMap(([boxIndex, course]) => {
      const score = courseScores[boxIndex] || 0;
      return course.uniqueCompetences.map(comp => ({
        competency: comp,
        score: Number(score) || 0
      }));
    });

    return {
      labels: ["Shared Competency", ...uniqueCompetencyScores.map(comp => comp.competency)],
      datasets: [{
        label: "Competency Scores",
        data: [sharedScore, ...uniqueCompetencyScores.map(comp => comp.score)],
        backgroundColor: ["#36A2EB", ...uniqueCompetencyScores.map(() => `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`)],
      }]
    };
  };

  return (
    <div className="home-container">
      <button onClick={() => navigate('/profile')}>👤 Profile</button>
      <button 
        onClick={() => {
          localStorage.removeItem("token");
          navigate('/login');
        }} 
        className="exit-button"
      >
        ↪️ Logout
      </button>
      <Bar data={calculateCompetencyScores()} />
    </div>
  );
};

export default Home;
