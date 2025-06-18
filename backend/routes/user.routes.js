import { Router } from "express";
import {
  getCurrentUser,
  updateAssistant,
  askToAssistant
} from "../controllers/user.controller.js";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

const userRouter = Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post(
  "/update",
  isAuth,
  upload.single("assistantImage"),
  updateAssistant
);
userRouter.post("/asktoassistant", isAuth, askToAssistant);

export default userRouter;
