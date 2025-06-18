import React, { useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { RiImageAddLine } from "react-icons/ri";
import { UserContext } from "../context/UserContext";

// --- Image Imports ---
// Make sure these paths are correct relative to your Customize component
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/authBg.png"; // Assuming this is an assistant image
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import image6 from "../assets/image6.jpeg";
import image7 from "../assets/image7.jpeg";

// --- Card Component (moved inside this file for simplicity as it's tightly coupled) ---
const Card = ({ image, selected, onClick }) => (
  <div
    className={`
      relative
      w-[120px] h-[200px] lg:w-[150px] lg:h-[250px]
      bg-[#0a0a2a] border-2 border-[#1a1a4a] rounded-2xl overflow-hidden
      cursor-pointer
      transform transition-all duration-300 ease-in-out
      hover:scale-105 hover:shadow-xl hover:shadow-[#0000ff66] hover:border-blue-400
      ${
        selected
          ? "scale-105 border-4 border-[#8A2BE2] shadow-2xl shadow-[#8A2BE2] animate-pulse-border-ai" // AI-centric pulsating border
          : ""
      }
    `}
    onClick={onClick}
  >
    <img
      src={image}
      alt="Assistant"
      className="w-full h-full object-cover transition-transform duration-300"
    />
    {selected && (
      <div className="absolute inset-0 bg-gradient-to-br from-[#8A2BE250] to-[#0000FF50] flex items-center justify-center animate-fade-in-check">
        {" "}
        {/* Semi-transparent gradient overlay */}
        <svg
          className="w-1/2 h-1/2 text-white drop-shadow-lg animate-bounce-in-check"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    )}
  </div>
);

// --- Customize Component ---
const Customize = () => {
  const navigate = useNavigate();
  const inputImage = useRef(null);

  const {
    frontendImage,
    setFrontendImage,
    setBackendImage, // This is for the actual file to send to backend
    selectedImage, // This is the URL or "input" string of the currently selected image
    setSelectedImage,
  } = useContext(UserContext);

  // Array of predefined images for easy mapping
  const predefinedImages = [
    image1,
    image2,
    image3,
    image4,
    image5,
    image6,
    image7,
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFrontendImage(reader.result); // Set URL for displaying in frontend
        setBackendImage(file); // Set actual file for backend upload
        setSelectedImage("input"); // Mark custom input as selected
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPredefinedImage = (imageSrc) => {
    setSelectedImage(imageSrc);
    setFrontendImage(null); // Clear custom image if a predefined one is selected
    setBackendImage(null); // Clear backend file too
    // You might want to handle what happens to backendImage when a predefined image is selected,
    // e.g., if your backend expects a URL or a specific ID for predefined images.
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-t from-black to-[#030353] flex justify-center items-center flex-col p-4 sm:p-5 relative overflow-hidden">
      {/* --- Back Button --- */}
      <button
        className="absolute top-6 left-6 sm:top-8 sm:left-8 p-2 sm:p-3 rounded-full bg-gradient-to-br from-[#1a1a4a] to-[#0d0d3d] text-white backdrop-blur-sm hover:shadow-xl hover:shadow-[#0000ff66] transition-all duration-300 transform hover:scale-110 shadow-lg border border-[#3a3a6a] z-10"
        onClick={() => navigate("/")}
        aria-label="Go back"
      >
        <MdOutlineKeyboardBackspace className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* --- Title --- */}
      <h1 className="text-white text-2xl sm:text-2xl sm:text-wrap lg:text-4xl font-semibold text-center mb-8 sm:mb-12 mt-20 sm:mt-24 drop-shadow-lg animate-fade-in-down">
        Select your <span className="text-blue-300">AI Assistant Image</span>
      </h1>

      {/* --- Image Selection Grid --- */}
      <div className="w-full max-w-[1000px] grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-8 justify-items-center animate-fade-in-up px-4 sm:px-0">
        {/* Predefined Cards */}
        {predefinedImages.map((imgSrc) => (
          <Card
            key={imgSrc} // Using imgSrc as key is better if unique
            image={imgSrc}
            selected={selectedImage === imgSrc}
            onClick={() => selectPredefinedImage(imgSrc)}
          />
        ))}

        {/* Custom Image Upload Card */}
        <div
          className={`
          relative
          w-[120px] h-[200px] sm:w-[130px] sm:h-[220px] lg:w-[150px] lg:h-[250px]
          bg-[#0a0a2a] border-2 border-[#1a1a4a] rounded-2xl overflow-hidden
          flex justify-center items-center cursor-pointer
          transform transition-all duration-300 ease-in-out
          hover:scale-105 hover:shadow-xl hover:shadow-[#0000ff66] hover:border-blue-400
          ${
            selectedImage === "input"
              ? "scale-105 border-4 border-[#8A2BE2] shadow-2xl shadow-[#8A2BE2] animate-pulse-border-ai"
              : ""
          }
        `}
          onClick={() => {
            inputImage.current.click();
            // setSelectedImage("input") is handled in handleImageUpload after file selection
          }}
        >
          {!frontendImage ? (
            <RiImageAddLine className="text-white w-1/3 h-1/3 opacity-70 group-hover:opacity-100 transition-opacity" />
          ) : (
            <img
              src={frontendImage}
              className="w-full h-full object-cover"
              alt="Custom Assistant"
            />
          )}
          {selectedImage === "input" && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#8A2BE250] to-[#0000FF50] flex items-center justify-center animate-fade-in-check">
              <svg
                className="w-1/2 h-1/2 text-white drop-shadow-lg animate-bounce-in-check"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          hidden
          ref={inputImage}
          onChange={handleImageUpload}
        />
      </div>

      {/* --- Next Button --- */}
      {selectedImage && (
        <button
          className="
          mt-12 sm:mt-16 px-8 py-3 sm:px-10 sm:py-4
          bg-gradient-to-r from-blue-600 to-purple-600
          text-white font-bold text-lg sm:text-xl rounded-full
          shadow-xl hover:shadow-2xl
          transform transition-all duration-300 ease-in-out
          hover:scale-105 active:scale-95
          focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50
          animate-bounce-up
        "
          onClick={() => navigate("/customize2")}
        >
          Next Step
        </button>
      )}
    </div>
  );
};

export default Customize;
