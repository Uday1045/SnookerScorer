import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";


import authRoutes from "./routes/authRoutes.js";
import tournamentRoutes from "./routes/tournaments.js";
import matchRoutes from "./routes/matches.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/matches", matchRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
