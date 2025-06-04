import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post("/api/ask-gemini", async (req, res) => {
  const userQuery = req.body.query;

  if (!userQuery || userQuery.trim() === "") {
    return res.status(400).json({ error: "Query cannot be empty." });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
        }),
      }
    );

    const data = await response.json();

    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (answer) {
      res.json({ answer });
    } else {
      res.json({
        answer: "No response from Gemini.",
        debug: data,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Gemini API call failed.",
      details: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

