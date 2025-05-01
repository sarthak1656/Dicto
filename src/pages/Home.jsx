import React from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/speech", { state: { fromHome: true } });
  };

  return (
    <>
      <Navbar />
      <section className="bg-white lg:grid lg:h-screen lg:place-content-center">
        <div className="mx-auto w-screen max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-prose text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Effortlessly convert your{" "}
              <span className="text-blue-700"> voice into text</span> in
              real-time.
            </h1>

            <p className="mt-4 text-base text-pretty text-gray-700 sm:text-lg/relaxed">
              Speak in your preferred language, and watch your words turn into
              accurate text. Whether you're taking notes, transcribing meetings,
              or capturing ideas, Dicto is built to keep up with your voice.
            </p>

            <div className="mt-4 flex justify-center gap-4 sm:mt-6">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 rounded border border-blue-600 bg-blue-600 px-5 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 group overflow-hidden"
              >
                <span className="relative flex items-center">
                  Get Started
                  <ArrowRightIcon className="w-5 h-5 ml-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
