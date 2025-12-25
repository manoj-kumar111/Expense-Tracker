import express from "express";
import { login, logout, register, changePassword } from "../controllers/user.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/password").put(isAuthenticated, changePassword);

export default router;
