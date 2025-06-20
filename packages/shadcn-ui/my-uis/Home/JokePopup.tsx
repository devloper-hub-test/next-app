"use client";

import { useState } from "react";

export default function JokePopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [joke, setJoke] = useState<{ setup: string; punchline: string } | null>(
    null
  );

  const loadJoke = async () => {
    try {
      const res = await fetch(
        "https://official-joke-api.appspot.com/jokes/programming/random"
      );
      const data = await res.json();
      setJoke(data[0]);
      setShowPopup(true);
    } catch (err) {
      console.error("Failed to fetch joke:", err);
      setJoke(null);
      setShowPopup(true);
    }
  };

  const closePopup = () => setShowPopup(false);

  return (
    <div>
      <button
        onClick={loadJoke}
        className="flex items-center gap-2 rounded-lg font-mono px-4 lg:px-8 py-2 border border-gray-300 dark:border-gray-600 bg-white text-black dark:bg-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 shadow-md transition-colors mt-6"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-blue-500 dark:text-blue-400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M11.999 0c-2.25 0-4.5.06-6.6.21a5.57 5.57 0 0 0-5.19 5.1c-.24 3.21-.27 6.39-.06 9.6a5.644 5.644 0 0 0 5.7 5.19h3.15v-3.9h-3.15c-.93.03-1.74-.63-1.83-1.56-.18-3-.15-6 .06-9 .06-.84.72-1.47 1.56-1.53 2.04-.15 4.2-.21 6.36-.21s4.32.09 6.36.18c.81.06 1.5.69 1.56 1.53.24 3 .24 6 .06 9-.12.93-.9 1.62-1.83 1.59h-3.15l-6 3.9V24l6-3.9h3.15c2.97.03 5.46-2.25 5.7-5.19.21-3.18.18-6.39-.03-9.57a5.57 5.57 0 0 0-5.19-5.1c-2.13-.18-4.38-.24-6.63-.24z" />
        </svg>
        Got jokes?
      </button>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="animate-fadeInUp bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {"Here's a Joke for You! 🤭"}
              </h2>
              <button
                className="text-gray-400 hover:text-red-500 transition-colors"
                onClick={closePopup}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {joke ? (
              <>
                <p className="text-lg italic mb-4">“{joke.setup}”</p>
                <p className="font-semibold text-brand-orange text-center text-xl">
                  👉 {joke.punchline}
                </p>
              </>
            ) : (
              <p className="text-center text-sm">Loading joke...</p>
            )}

            <div className="mt-6">
              <button
                onClick={closePopup}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md"
              >
                Got it! 😂
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
