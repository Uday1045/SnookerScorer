import express from "express";
import { createMatch, getMatches,hellopage } from "../controllers/matchController.js";
import { protect } from "../middleware/middle.js";

const router = express.Router();
router.get("/hello",hellopage);
router.get("/", protect, getMatches); // ✅ protected GET
router.post("/", protect, createMatch); // ✅ protected POST

export default router;
