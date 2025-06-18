// Essential imports
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import aiImg from "../assets/ai.gif"; // Make sure these paths are correct
import userImg from "../assets/user.gif"; // Make sure these paths are correct
import { FiLogOut, FiSettings, FiSend, FiMenu, FiX } from "react-icons/fi";
import { MdHistory, MdClose } from "react-icons/md";

const Home = () => {
  const { userData, serverUrl, setUserData, getGeminiResponse } =
    useContext(UserContext);
  const navigate = useNavigate();
  const isSpeaking = useRef(false); // Ref to track if AI is speaking (avoids re-renders for frequent updates)
  const recognitionRef = useRef(null); // Ref to hold the SpeechRecognition object
  const [listening, setListening] = useState(false); // State to indicate if mic is active
  const [displayText, setDisplayText] = useState(
    "Your reply will appear here."
  ); // AI textbox content
  const [inputMessage, setInputMessage] = useState(""); // User's text input field content
  const [isProcessing, setIsProcessing] = useState(false); // State for AI thinking/processing
  const [showHistory, setShowHistory] = useState(false); // State to toggle history panel
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const speechSynthesis = window.speechSynthesis;

  // --- Utility Functions ---
  const logout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const speak = (text) => {
    // 1. Stop current recognition if active before AI speaks
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false); // Manually set listening false after stopping
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    const voices = speechSynthesis.getVoices();
    const preferredVoice =
      voices.find(
        (v) => v.name === "Microsoft David - English (United States)"
      ) ||
      voices.find((v) => v.lang === "en-US") ||
      voices[0];

    if (preferredVoice) utterance.voice = preferredVoice;

    isSpeaking.current = true; // Set AI speaking flag
    utterance.onend = () => {
      isSpeaking.current = false; // Clear AI speaking flag
      setIsProcessing(false); // AI has finished processing and speaking
      // 2. After AI finishes speaking, reset display text and restart recognition
      setDisplayText("Your reply will appear here."); // Reset to default idle message
      // Only restart recognition if the user is not typing in the text input box
      if (!inputMessage.trim()) {
        setTimeout(startRecognition, 800); // Small delay before restarting mic
      }
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      isSpeaking.current = false; // Clear AI speaking flag
      setIsProcessing(false); // AI processing finished (with error)
      setDisplayText("Speech error. Please try again."); // Show error message
      if (!inputMessage.trim()) {
        setTimeout(startRecognition, 800); // Attempt to restart recognition
      }
    };

    speechSynthesis.cancel(); // Stop any previous speech
    speechSynthesis.speak(utterance);
  };

  const processUserInput = async (text) => {
    if (!text.trim()) {
      setIsProcessing(false);
      setDisplayText("Your reply will appear here."); // Reset if input was empty
      return;
    }

    // 3. Stop recognition if active when processing ANY user input (voice or text)
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false); // Manually set listening false after stopping
    }

    setIsProcessing(true); // Set AI processing flag
    setDisplayText("Thinking..."); // Show thinking message immediately
    setInputMessage(""); // Clear user's text input field

    try {
      console.log("Prompt sent to Gemini:", text);
      const result = await getGeminiResponse(text);
      handleAICommand(result);
    } catch (err) {
      console.error("Error getting Gemini response:", err);
      const errorMessage =
        "I apologize, but I encountered an error. Please try again.";
      speak(errorMessage); // Speak the error
      setDisplayText(errorMessage); // Display the error text
      setIsProcessing(false); // Ensure processing is off
    }
  };

  const handleAICommand = (data) => {
    const { type, userInput, response } = data;
    if (!response) {
      speak("Sorry, I didn't get that.");
      setDisplayText("Sorry, I didn't get that.");
      setIsProcessing(false); // Ensure processing is off
      return;
    }

    setDisplayText(response); // Crucial: Set AI's actual text response to display
    speak(response); // Start speaking the AI's response

    const openInNewTab = (url) =>
      window.open(url, "_blank", "noopener,noreferrer");

    switch (type) {
      case "google_open":
      case "Google Search":
        openInNewTab(
          `https://www.google.com/search?q=${encodeURIComponent(userInput)}`
        );
        break;

      case "Youtube":
      case "youtube_search":
      case "youtube_play":
        openInNewTab(
          `https://www.youtube.com/results?search_query=${encodeURIComponent(
            userInput
          )}`
        );
        break;

      case "instagram_open":
      case "facebook_open":
        openInNewTab(`https://www.${type.split("_")[0]}.com`); // Dynamic URL for social media
        break;
      case "calculator_open":
        openInNewTab("https://www.google.com/search?q=calculator");
        break;
      case "weather_show":
        openInNewTab("https://www.google.com/search?q=weather");
        break;
      case "get_time":
      case "get_date":
      case "get_day":
      case "get_month":
        // Speech synthesis already handles these specific responses
        break;
      default:
        break;
    }
  };

  const startRecognition = () => {
    // Only attempt to start if not already listening, AI not busy, and user not typing
    if (
      recognitionRef.current &&
      !listening &&
      !isProcessing &&
      !isSpeaking.current &&
      !inputMessage.trim()
    ) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        // Log if already started, but don't treat as critical error in this context
        if (!err.message.includes("already started")) {
          console.error("Recognition start error:", err);
        }
      }
    }
  };

  // --- useEffect for Speech Recognition Setup and Lifecycle ---
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      setDisplayText("Speech Recognition not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Key: Listen for one phrase, then stop
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.interimResults = true; // Enable interim results for smoother live display of voice input
    recognitionRef.current = recognition; // Store ref to the recognition object

    // Ensure voices are loaded for speech synthesis
    const loadVoices = () => {
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    };
    loadVoices();

    // Event Handlers for Speech Recognition
    recognition.onstart = () => {
      console.log("Voice recognition ON.");
      setListening(true);
      // When recognition starts, show 'Listening...' or your custom prompt
      // but prioritize if AI is still processing/speaking from a previous action.
      if (!isProcessing && !isSpeaking.current) {
        setDisplayText("Listening...");
      }
    };

    recognition.onend = () => {
      console.log("Voice recognition OFF.");
      setListening(false);
      // Decide whether to restart listening or show default message
      if (!isProcessing && !isSpeaking.current && !inputMessage.trim()) {
        // If system is idle after recognition ends, restart
        setTimeout(startRecognition, 1000); // Give a brief pause before restarting
      } else if (
        !isProcessing &&
        !isSpeaking.current &&
        displayText !== "Thinking..."
      ) {
        // If AI is not busy but recognition stopped (e.g., no speech detected, and no AI response to display)
        setDisplayText("Your reply will appear here.");
      }
    };

    recognition.onerror = (event) => {
      console.error("Recognition error:", event.error);
      setListening(false); // Stop listening state
      // Only attempt to restart if it's not an explicit abort and system is idle
      if (
        event.error !== "aborted" && // 'aborted' means we manually stopped it
        !isProcessing &&
        !isSpeaking.current &&
        !inputMessage.trim()
      ) {
        if (event.error === "no-speech") {
          // If no speech detected, return to default message and try to restart
          setDisplayText("Your reply will appear here.");
          setTimeout(startRecognition, 1500); // Try again after a short delay
        } else {
          // For other errors, show a temporary error message
          setDisplayText("Voice input error. Your reply will appear here.");
          setTimeout(startRecognition, 1500); // Try again after a short delay
        }
      } else if (!isProcessing && !isSpeaking.current) {
        // If recognition was aborted or another error, but system is now idle, return to default message
        setDisplayText("Your reply will appear here.");
      }
    };

    recognition.onresult = async (e) => {
      const interimTranscript = Array.from(e.results)
        .map((result) => result[0].transcript)
        .join("");

      // Show interim results in the display text box
      if (interimTranscript) {
        setDisplayText(interimTranscript);
      }

      if (e.results[0].isFinal) {
        const finalTranscript = interimTranscript.trim();
        console.log("Heard (final):", finalTranscript);

        if (finalTranscript) {
          // Ensure actual speech was transcribed
          // Immediately stop current recognition to prevent it from auto-restarting
          // before we've processed the input and AI has responded.
          recognition.stop(); // This will trigger onend
          await processUserInput(finalTranscript);
        } else {
          // If final result is empty, return to idle state
          setDisplayText("Your reply will appear here.");
          // Re-start recognition if idle, as nothing was understood
          if (!isProcessing && !isSpeaking.current && !inputMessage.trim()) {
            setTimeout(startRecognition, 500);
          }
        }
      }
    };

    // Initial start of recognition on component mount, if AI is idle
    // Give a slightly longer initial delay to ensure all states are settled
    setTimeout(() => {
      if (!isProcessing && !isSpeaking.current && !inputMessage.trim()) {
        startRecognition();
      }
    }, 2000); // Increased initial delay to 2 seconds

    // Cleanup function when component unmounts or dependencies change
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop(); // Stop any active recognition
      }
      speechSynthesis.cancel(); // Stop any active speech
      setListening(false);
    };
    // Critical dependencies for re-evaluating recognition state
  }, []);

  // Redirect to customize if assistant name is not set
  useEffect(() => {
    if (userData && !userData.assistantName) {
      navigate("/customize");
    }
  }, []);

  // --- Text Input Handlers ---
  const handleTextInputSubmit = () => {
    // Manually stop recognition if active when submitting text input
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false); // Manually set listening false
    }
    processUserInput(inputMessage);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent new line on Enter
      handleTextInputSubmit();
    }
  };

  // --- Rendered JSX ---
  return (
    <div className="w-full min-h-screen bg-gradient-to-t from-black to-[#02023d] flex flex-col items-center justify-between gap-6 p-4 relative overflow-hidden">
      {/* --- Hamburger Menu Icon (Mobile Only) --- */}
      <div className="absolute top-5 left-5 z-20 md:hidden">
        <button
          className="p-3 rounded-full bg-gradient-to-br from-[#1a1a4a] to-[#0d0d3d] text-white shadow-lg hover:shadow-xl hover:shadow-[#0000ff66] transition-all duration-300 border border-[#3a3a6a]"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
        >
          <FiMenu className="text-2xl" />
        </button>
      </div>

      {/* --- Desktop Buttons (Hidden on Mobile) --- */}
      <div className="hidden md:flex absolute top-5 right-5 flex-col items-end gap-3 z-10 animate-fade-in-right">
        <button
          className="flex items-center px-5 py-2.5 rounded-full bg-gradient-to-br from-[#1a1a4a] to-[#0d0d3d] text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:shadow-[#0000ff66] transition-all duration-300 transform hover:scale-105 border border-[#3a3a6a]"
          onClick={logout}
          aria-label="Logout"
        >
          <FiLogOut className="mr-2 text-lg" />
          Logout
        </button>
        <button
          className="flex items-center px-5 py-2.5 rounded-full bg-gradient-to-br from-[#1a1a4a] to-[#0d0d3d] text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:shadow-[#0000ff66] transition-all duration-300 transform hover:scale-105 border border-[#3a3a6a]"
          onClick={() => navigate("/customize")}
          aria-label="Customize Assistant"
        >
          <FiSettings className="mr-2 text-lg" />
          Customize Assistant
        </button>
        <button
          className="flex items-center px-4 py-2 rounded-full bg-gradient-to-br from-[#1a1a4a] to-[#0d0d3d] text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:shadow-[#0000ff66] transition-all duration-300 transform hover:scale-105 border border-[#3a3a6a]"
          onClick={() => setShowHistory(!showHistory)}
          aria-label={
            showHistory
              ? "Hide Interaction History"
              : "Show Interaction History"
          }
        >
          <MdHistory className="mr-2 text-lg" />
          {showHistory ? "Hide History" : "Show History"}
        </button>
      </div>

      {/* --- Mobile Menu Overlay --- */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-lg flex flex-col items-center justify-center z-30 animate-fade-in-panel">
          <button
            className="absolute top-6 right-6 text-white text-3xl opacity-70 hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <FiX />
          </button>
          <div className="flex flex-col gap-6">
            <button
              className="flex items-center px-6 py-3 rounded-full bg-gradient-to-br from-[#1a1a4a] to-[#0d0d3d] text-white text-lg font-semibold shadow-lg hover:shadow-xl hover:shadow-[#0000ff66] transition-all duration-300 transform hover:scale-105 border border-[#3a3a6a]"
              onClick={() => {
                setShowHistory(true);
                setIsMenuOpen(false);
              }}
              aria-label="Show Interaction History"
            >
              <MdHistory className="mr-3 text-2xl" />
              History
            </button>
            <button
              className="flex items-center px-6 py-3 rounded-full bg-gradient-to-br from-[#1a1a4a] to-[#0d0d3d] text-white text-lg font-semibold shadow-lg hover:shadow-xl hover:shadow-[#0000ff66] transition-all duration-300 transform hover:scale-105 border border-[#3a3a6a]"
              onClick={() => {
                navigate("/customize");
                setIsMenuOpen(false);
              }}
              aria-label="Customize Assistant"
            >
              <FiSettings className="mr-3 text-2xl" />
              Customize
            </button>
            <button
              className="flex items-center px-6 py-3 rounded-full bg-gradient-to-br from-[#1a1a4a] to-[#0d0d3d] text-white text-lg font-semibold shadow-lg hover:shadow-xl hover:shadow-[#0000ff66] transition-all duration-300 transform hover:scale-105 border border-[#3a3a6a]"
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              aria-label="Logout"
            >
              <FiLogOut className="mr-3 text-2xl" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* --- History Panel Overlay --- */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-lg flex flex-col items-center justify-start pt-28 px-4 z-20 animate-fade-in-panel">
          <button
            className="absolute top-6 right-6 text-white text-3xl opacity-70 hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
            onClick={() => setShowHistory(false)}
            aria-label="Close history"
          >
            <FiX /> {/* Using FiX for close consistency */}
          </button>

          <div className="bg-gradient-to-br from-[#0c0c2e] to-[#06061e] rounded-xl p-6 shadow-2xl border border-white border-opacity-15 w-full max-w-2xl max-h-[75vh] overflow-y-auto custom-scrollbar animate-scale-in-panel">
            <h2 className="text-white text-2xl md:text-3xl font-extrabold mb-5 pb-2 border-b border-white border-opacity-20 flex items-center">
              <MdHistory className="mr-3 text-3xl text-blue-400" />
              Your Interaction History
            </h2>
            {userData?.history?.length > 0 ? (
              <div className="space-y-3">
                {userData.history.map((item, idx) => (
                  <p
                    key={idx}
                    className="text-gray-300 text-sm md:text-base leading-relaxed bg-[#1a1a4a] p-3 rounded-md shadow-inner border border-gray-700 border-opacity-30 animate-slide-up-history"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {item}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-base md:text-lg italic text-center py-6">
                No history available yet. Start a conversation!
              </p>
            )}
          </div>
        </div>
      )}

      {/* --- Main Assistant Display Area --- */}
      <div className="flex flex-col items-center gap-5 z-0 animate-main-content-fade-in mt-20 md:mt-28 mb-auto px-4 w-full">
        {/* Assistant Image */}
        <div className="w-[200px] h-[300px] sm:w-[250px] sm:h-[350px] md:w-[280px] md:h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-blue-400 transform hover:scale-105 transition-transform duration-700 ease-in-out">
          <img
            src={userData?.assistantImage}
            alt="Assistant"
            className="w-full h-full object-cover transform scale-100 hover:scale-110 transition-transform duration-700 ease-in-out"
          />
        </div>
        <h1 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-xl text-center px-2 animate-slide-in-up-name">
          {userData?.assistantName || "Awaiting Commands"}
        </h1>
      </div>

      {/* --- Unified Message/Input Box at the Bottom --- */}
      <div className="w-full max-w-2xl px-4 pb-8 flex flex-col items-center gap-4 animate-message-fade-in">
        {/* AI/User Response Indicator Image */}
        <div
          className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-2xl flex items-center justify-center border-3 ${
            listening || isProcessing
              ? "border-blue-400 animate-pulse-border-listening"
              : "border-white border-opacity-20"
          } transition-all duration-500`}
        >
          <img
            src={isProcessing ? aiImg : userImg}
            className="w-full h-full object-cover rounded-full p-0.5"
            alt="response indicator"
          />
        </div>

        {/* Unified Display Textbox (AI's Text/Status) */}
        <div className="w-full h-12 sm:h-14 bg-gradient-to-br from-[#1a1a4a] to-[#0d0d3d] border border-[#3a3a6a] rounded-full text-white px-5 flex items-center justify-center shadow-lg animate-fade-in-up-message">
          <p className="text-white text-base sm:text-lg font-light leading-relaxed tracking-wide text-shadow overflow-hidden text-ellipsis whitespace-nowrap">
            {displayText}
          </p>
        </div>

        {/* User's Text Input Field */}
        <div className="relative w-full">
          <input
            type="text"
            className="w-full h-12 sm:h-14 bg-gradient-to-br from-[#1a1a4a] to-[#0d0d3d] border border-[#3a3a6a] rounded-full text-white px-5 pr-14 outline-none focus:border-blue-400 focus:shadow-lg focus:shadow-blue-900 transition-all duration-300 text-base sm:text-lg placeholder-gray-400"
            placeholder="Type your message here..."
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              if (recognitionRef.current && listening) {
                recognitionRef.current.stop();
                setListening(false);
              }
            }}
            onKeyDown={handleKeyDown}
            disabled={isSpeaking.current || isProcessing}
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            onClick={handleTextInputSubmit}
            disabled={
              !inputMessage.trim() || isSpeaking.current || isProcessing
            }
            aria-label="Send message"
          >
            <FiSend className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
