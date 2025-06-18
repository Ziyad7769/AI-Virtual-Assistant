import User from "../model/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import moment from "moment/moment.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(400).json({ message: "user not found " });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(400).json({ message: "get current user error" });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    let assistantImage;

    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else {
      assistantImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        assistantName,
        assistantImage,
      },
      { new: true }
    ).select("-password");
    res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: "get current user error" });
  }
};
export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    if (!command || typeof command !== "string" || command.trim() === "") {
      return res
        .status(400)
        .json({ response: "Command is missing or invalid." });
    }
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ response: "User not found." });
    }

    user.history.push(command);
    await user.save();

    const result = await geminiResponse(command, user.assistantName, user.name);
    if (!result || typeof result !== "string") {
      return res
        .status(400)
        .json({ response: "Sorry, I didn't understand that." });
    }
    console.log("Gemini raw response:", result);

    const jsonMatch = result.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      return res
        .status(400)
        .json({ response: "Sorry, I didn't understand that." });
    }

    let gemResult;
    try {
      gemResult = JSON.parse(jsonMatch[0]);
    } catch (err) {
      return res
        .status(400)
        .json({ response: "Sorry, I couldn't process that." });
    }

    const { type, userInput, response } = gemResult;

    // Handle special types (date, time, etc.)
    const momentResponses = {
      get_date: `The current date is ${moment().format("YYYY-MM-DD")}`,
      get_time: `The current time is ${moment().format("hh:mm A")}`,
      get_day: `Today is ${moment().format("dddd")}`,
      get_month: `The current month is ${moment().format("MMMM")}`,
    };

    if (momentResponses[type]) {
      return res.json({ type, userInput, response: momentResponses[type] });
    }

    // Handle general AI commands
    const allowedTypes = [
      "google_search",
      "youtube_search",
      "youtube_play",
      "general",
      "calculator_open",
      "instagram_open",
      "facebook_open",
      "weather_show",
    ];

    if (allowedTypes.includes(type)) {
      return res.json({ type, userInput, response });
    }

    // Unknown command type
    return res
      .status(400)
      .json({ response: "Sorry, I couldn't understand that command." });
  } catch (error) {
    console.error("Assistant Error:", error);
    return res
      .status(500)
      .json({ response: "An error occurred while processing your request." });
  }
};
