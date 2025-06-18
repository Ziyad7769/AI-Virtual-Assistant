import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { FaRobot, FaSpinner } from "react-icons/fa"; // Importing additional icons

const Customize2 = () => {
  const { userData, backendImage, selectedImage, setUserData, serverUrl } =
    useContext(UserContext);
  const [assistantName, setAssistantName] = useState(
    userData?.assistantName || ""
  );
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleUpdateAssistant = async () => {
    if (!assistantName.trim()) return;

    setLoading(true);
    try {
      let formData = new FormData();
      formData.append("assistantName", assistantName);

      // Determine which image data to send: the File object for custom, or the URL for predefined
      if (backendImage) {
        formData.append("assistantImage", backendImage); // This is the File object
      } else if (selectedImage && selectedImage !== "input") {
        formData.append("imageUrl", selectedImage); // This is the URL of a predefined image
      }
      // If selectedImage is "input" but no backendImage (e.g., user clicked custom but didn't select a file)
      // then no image data will be sent, which might be desired, or you could add validation.

      const result = await axios.post(
        `${serverUrl}/api/user/update`,
        formData,
        { withCredentials: true }
      );

      setUserData(result.data);
      setLoading(false);
      navigate("/"); // Redirect to home after success
    } catch (error) {
      setLoading(false);
      console.error("Error updating assistant:", error); // Use console.error for errors
      // You might want to show a user-friendly error message here
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-t from-black to-[#030353] flex justify-center items-center flex-col p-4 sm:p-5 relative overflow-hidden">
      {/* --- Back Button --- */}
      <button
        className="absolute top-6 left-6 sm:top-8 sm:left-8 p-2 sm:p-3 rounded-full bg-gradient-to-br from-[#1a1a4a] to-[#0d0d3d] text-white backdrop-blur-sm hover:shadow-xl hover:shadow-[#0000ff66] transition-all duration-300 transform hover:scale-110 shadow-lg border border-[#3a3a6a] z-10"
        onClick={() => navigate("/customize")}
        aria-label="Go back to image selection"
      >
        <MdOutlineKeyboardBackspace className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* --- Title --- */}
      <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-8 sm:mb-12 mt-12 sm:mt-16 drop-shadow-lg animate-fade-in-down">
        Name your <span className="text-blue-300">AI Assistant</span>
      </h1>

      {/* --- Assistant Icon (Visual cue) --- */}
      <FaRobot className="text-white text-6xl sm:text-8xl mb-6 sm:mb-8 opacity-70 animate-bounce-icon" />

      {/* --- Input Field --- */}
      <input
        type="text"
        placeholder="Enter your Assistant Name"
        className="w-full max-w-xl sm:max-w-2xl px-5 py-3 sm:px-6 sm:py-4 outline-none border-2 border-white border-opacity-30 bg-transparent text-white placeholder-gray-400 text-lg sm:text-xl rounded-full shadow-lg focus:border-blue-400 focus:shadow-xl focus:shadow-blue-900 transition-all duration-300 animate-slide-in-up"
        value={assistantName}
        onChange={(e) => setAssistantName(e.target.value)}
        required
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleUpdateAssistant();
          }
        }}
      />

      {/* --- Call to Action Button --- */}
      {assistantName.trim() && ( // Only show if assistantName is not empty
        <button
          className="
          mt-12 sm:mt-16 px-8 py-3 sm:px-10 sm:py-4
          bg-gradient-to-r from-blue-600 to-purple-600
          text-white font-bold text-lg sm:text-xl rounded-full
          shadow-xl hover:shadow-2xl
          transform transition-all duration-300 ease-in-out
          hover:scale-105 active:scale-95
          focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50
          animate-bounce-up flex items-center justify-center gap-2 sm:gap-3
        "
          onClick={handleUpdateAssistant}
          disabled={loading} // Disable button when loading
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" /> Saving...
            </>
          ) : (
            <>
              <FaRobot className="mr-2" /> Create My Assistant
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default Customize2;
