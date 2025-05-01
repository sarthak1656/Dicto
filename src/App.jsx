import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SpeechToText from "./pages/SpeechToText";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/speech" element={<SpeechToText />} />
      </Routes>
    </Router>
  );
}

export default App;
