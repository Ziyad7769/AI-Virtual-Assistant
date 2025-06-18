import { UserContext } from "../context/UserContext";
import { useContext } from "react";

const Card = ({ image }) => {
  const {
    serverUrl,
    userData,
    setUserData,
    frontendImage,
    setFrontendImage,
    backendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
  } = useContext(UserContext);

  return (
    <div
      className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#020220] border-2 border-[#0000ff66] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 hover:border-4 hover:border-white cursor-pointer 
        ${
          selectedImage == image
            ? "border-4 border-white shadow-2xl shadow-blue-950"
            : null
        }`}
      onClick={() => setSelectedImage(image)}
    >
      <img src={image} alt="ai images" className="h-full object-cover" />
    </div>
  );
};

export default Card;
