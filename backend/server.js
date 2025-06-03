import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk'; // Import Groq SDK

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // Use port 3001 for backend

// Initialize Groq SDK with your API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Middleware
// Enable CORS for specified origins
app.use(cors({
  // This array allows requests from both your local development frontend (Vite's default)
  // and your deployed Vercel frontend.
  // IMPORTANT: Replace 'https://YOUR_VERCEL_FRONTEND_URL.vercel.app' with your actual Vercel URL!
  origin: ['http://localhost:5173', 'https://YOUR_VERCEL_FRONTEND_URL.vercel.app'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json()); // To parse JSON request bodies

// Chat API endpoint
app.post('/chat', async (req, res) => {
  const { messages } = req.body; // Expecting an array of messages

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: "Messages array is required and cannot be empty." });
  }

  // Ensure messages are in Groq's expected format (role: 'user'/'assistant', content: 'text')
  // The frontend sends it in a compatible format already.
  const formattedMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: "llama3-8b-8192", // You can choose other models available on Groq
      temperature: 0.7, // Adjust creativity (0.0 - 1.0)
      max_tokens: 1024, // Max tokens in the response
    });

    const botReply = chatCompletion.choices[0]?.message?.content;

    if (botReply) {
      res.json({ reply: botReply });
    } else {
      res.status(500).json({ message: "No response content from Groq API." });
    }
  } catch (error) {
    console.error("Error communicating with Groq API:", error);
    if (error.response) {
      // Groq API specific errors (e.g., invalid key, rate limits)
      console.error("Groq API error response:", error.response.data);
      res.status(error.response.status).json({ message: error.response.data.message || "Groq API error." });
    } else if (error.request) {
      // No response from Groq API (network issue)
      res.status(503).json({ message: "Groq API is unreachable. Please check your network connection." });
    } else {
      // Other errors
      res.status(500).json({ message: "An unexpected error occurred while processing your request." });
    }
  }
});

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.send('Chatbot backend is running!');
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});