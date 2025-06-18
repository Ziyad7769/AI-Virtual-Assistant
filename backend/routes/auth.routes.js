import { Router } from "express";
import { Login, logout, signUp } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/signup", signUp);
authRouter.post("/login", Login);
authRouter.get("/logout", logout);

export default authRouter;
