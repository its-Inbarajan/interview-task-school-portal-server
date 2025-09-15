import { Router } from "express";
import { login, signup } from "../controllers/auth.controller";

const userRoter = Router();

userRoter.post("/login", login);
userRoter.post("/signup", signup);

export default userRoter;
