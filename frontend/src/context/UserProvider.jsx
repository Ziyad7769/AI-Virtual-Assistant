import { useState, useEffect } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

const UserProvider = ({ children }) => {
  const serverUrl = "http://localhost:5000";
  const [userData, setUserData] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });
      setUserData(result.data);
    } catch (error) {
      console.log("Error fetching current user:", error);
    }
  };

  const getGeminiResponse = async (command) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching Gemini response:", error);
      throw error;
    }
  };

  useEffect(() => {
    handleCurrentUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        serverUrl,
        userData,
        setUserData,
        frontendImage,
        setFrontendImage,
        backendImage,
        setBackendImage,
        selectedImage,
        setSelectedImage,
        getGeminiResponse,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
