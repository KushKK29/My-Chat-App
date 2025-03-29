import express from "express";
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", (req, res, next) => {
  try {
    protectRoute(req, res, () => checkAuth(req, res));
  } catch (error) {
    res.status(401).json({ message: "Not authenticated" });
  }
});

export default router;
