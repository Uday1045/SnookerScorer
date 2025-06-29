import express from "express";
import { createMatch, getMatches } from "../controllers/matchController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/", protect, getMatches); // ✅ protected GET
router.post("/", protect, createMatch); // ✅ protected POST

export default router;
