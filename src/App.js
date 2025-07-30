import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import AutomataSimulator from "./AutomataSimulator";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/simulator" element={<AutomataSimulator />} />
      </Routes>
    </Router>
  );
}