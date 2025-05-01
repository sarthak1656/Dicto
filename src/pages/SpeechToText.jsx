import React, { useEffect, useRef, useState } from "react";
import { MicrophoneIcon, TrashIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import Navbar from "../components/Navbar";
import { useLocation, Navigate } from "react-router-dom";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
];

const SpeechToText = () => {
  const location = useLocation();

  // Redirect if not accessed from the home page
  if (!location.state?.fromHome) {
    return <Navigate to="/" replace />;
  }

  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [language, setLanguage] = useState("en");
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Waveform refs
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationIdRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
  }, []);

  const draw = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    animationIdRef.current = requestAnimationFrame(draw);

    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#3b82f6"; // Tailwind blue-600
    ctx.beginPath();

    const sliceWidth = WIDTH / dataArrayRef.current.length;
    let x = 0;

    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const v = dataArrayRef.current[i] / 128.0;
      const y = (v * HEIGHT) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  const startListening = async () => {
    if (!recognitionRef.current) return;

    // Start speech recognition
    recognitionRef.current.lang = language;
    recognitionRef.current.start();

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = transcript;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const speech = result[0].transcript;
        if (result.isFinal) {
          finalTranscript += finalTranscript ? " " + speech : speech;
        } else {
          interimTranscript += " " + speech;
        }
      }

      setTranscript(finalTranscript.trim());
      setInterim(interimTranscript.trim());
    };

    recognitionRef.current.onend = () => {
      if (recording) {
        startListening();
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Recognition error:", event.error);
      stopListening();
    };

    // Start waveform audio stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current = source;

      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;
      dataArrayRef.current = new Uint8Array(
        analyserRef.current.frequencyBinCount
      );

      draw();
    } catch (err) {
      console.error("Microphone access denied or error:", err);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }

    if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    setRecording(false);
  };

  const handleRecordClick = () => {
    if (!recording) {
      setRecording(true);
      startListening();
    } else {
      stopListening();
    }
  };

  const handleClear = () => {
    stopListening();
    setTranscript("");
    setInterim("");
  };

  const handleDownload = () => {
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "speech-to-text.txt";
    link.click();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-poppins">
        <h1 className="text-5xl font-bold mb-6 text-center">
          <span className="text-blue-700">Speech</span> to Text
        </h1>

        {/* Language Selection */}
        <div className="mb-6 w-full max-w-xl mt-10 flex items-center justify-center flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <label className="mb-2 sm:mb-0 font-medium text-slate-600">
              Language:
            </label>
            <select
              className="border rounded px-3 py-2 w-full sm:w-auto"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRecordClick}
            className={`mt-4 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded font-semibold text-white transition ${
              recording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-700 hover:bg-blue-800"
            }`}
          >
            {recording ? (
              // Show waveform instead of mic icon
              <span className="waveform">
                <span className="bar bar1"></span>
                <span className="bar bar2"></span>
                <span className="bar bar3"></span>
                <span className="bar bar4"></span>
                <span className="bar bar5"></span>
              </span>
            ) : (
              <MicrophoneIcon className="h-5 w-5" />
            )}
            {recording ? "Stop Listening" : "Start Listening"}
          </button>
        </div>

        {/* Waveform Canvas */}
        <canvas
          ref={canvasRef}
          width={500}
          height={100}
          className="bg-gray-50 border rounded shadow mb-4"
        />

        {/* Transcript Box */}
        <div className="bg-gray-50 w-full max-w-xl p-4 border rounded shadow mb-4 min-h-[150px]">
          <p className="text-gray-800 whitespace-pre-wrap">{transcript}</p>
          {interim && <p className="text-gray-400 italic">{interim}</p>}
        </div>

        {/* Clear & Download Buttons */}
        <div className="flex items-center justify-center flex-col sm:flex-row sm:space-x-4 w-full max-w-xl">
          <button
            onClick={handleClear}
            className="mb-2 sm:mb-0 w-full sm:w-auto px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded flex items-center justify-center gap-2"
          >
            <TrashIcon className="h-5 w-5" />
            Clear
          </button>
          <button
            onClick={handleDownload}
            disabled={!transcript}
            className={`w-full sm:w-auto px-4 py-2 flex items-center justify-center gap-2 ${
              transcript
                ? "bg-slate-800 hover:bg-blue-900"
                : "bg-slate-700 cursor-not-allowed"
            } text-white rounded`}
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Download
          </button>
        </div>
      </div>
    </>
  );
};

export default SpeechToText;
