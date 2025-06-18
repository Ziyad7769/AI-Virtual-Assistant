import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import authBg from "../assets/authbg.png";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {UserContext} from "../context/UserContext";
import axios from "axios";

const SignUp = () => {
  const { serverUrl, userData, setUserData } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(" ");
    setLoading(true);
    try {
      let result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          name,
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );
      setUserData(result.data);
      setLoading(false);
      navigate("/customize");
    } catch (err) {
      setUserData(null);
      setLoading(false);
      setError(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="w-full min-h-screen relative flex justify-center items-center overflow-hidden">
      {/* Background Image - Absolute positioning for full cover */}
      <img
        src={authBg}
        alt="AI Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <form
        className="relative w-[95%] sm:w-[90%] max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-auto py-8 sm:py-10 px-6 sm:px-8 bg-[#00000062] backdrop-blur-lg shadow-2xl shadow-black flex flex-col items-center gap-y-5 sm:gap-y-6 rounded-xl z-10"
        onSubmit={handleSignUp}
      >
        <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center mb-6 sm:mb-8 leading-tight">
          Register to <span className="text-blue-400">Virtual Assistant</span>
        </h1>

        <input
          type="text"
          placeholder="Enter your Name"
          className="w-full h-12 sm:h-14 outline-none border-2 border-white border-opacity-50 bg-transparent text-white placeholder-gray-300 text-base sm:text-lg rounded-full px-5 py-2.5 transition-all duration-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full h-12 sm:h-14 outline-none border-2 border-white border-opacity-50 bg-transparent text-white placeholder-gray-300 text-base sm:text-lg rounded-full px-5 py-2.5 transition-all duration-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="relative w-full h-12 sm:h-14 border-2 border-white border-opacity-50 bg-transparent rounded-full text-white">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-5 py-2.5 pr-12 text-base sm:text-lg transition-all duration-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {/* Eye icons */}
          {!showPassword ? (
            <IoEye
              className="absolute top-1/2 right-4 -translate-y-1/2 w-6 h-6 text-white cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
              onClick={() => setShowPassword(true)}
              aria-label="Show password"
            />
          ) : (
            <IoEyeOff
              className="absolute top-1/2 right-4 -translate-y-1/2 w-6 h-6 text-white cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
              onClick={() => setShowPassword(false)}
              aria-label="Hide password"
            />
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm sm:text-base text-center mt-2">
            *{error}
          </p>
        )}

        <button
          className="w-full max-w-[200px] h-12 sm:h-14 bg-white rounded-full text-black font-semibold text-lg sm:text-xl mt-4 sm:mt-6 hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-gray-800 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Sign Up"
          )}
        </button>

        <p
          className="text-white text-sm sm:text-base cursor-pointer mt-4"
          onClick={() => navigate("/login")}
        >
          Already have an account?{" "}
          <span className="text-blue-400 font-semibold hover:underline">
            Log In
          </span>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
