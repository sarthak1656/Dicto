import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SpeechToText from "./pages/SpeechToText";
import Home from "./pages/Home";
import { Analytics } from "@vercel/analytics/react"; // Import Analytics

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/speech" element={<SpeechToText />} />
        </Routes>
      </Router>
      <Analytics /> {/* Vercel Analytics */}
    </>
  );
}

export default App;
