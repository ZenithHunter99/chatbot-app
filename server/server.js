// server/server.js
require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const cors = require('cors'); // For handling Cross-Origin requests
const axios = require('axios'); // For making HTTP requests to GROQ

const app = express();
const PORT = process.env.PORT || 5000;
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Get API key from .env

// --- Essential Middleware ---
app.use(cors()); // Allow all origins for development. For production, restrict this.
app.use(express.json()); // Parse JSON request bodies

// --- Verify API Key Presence ---
if (!GROQ_API_KEY) {
    console.error("ERROR: GROQ_API_KEY is not set in the .env file!");
    process.exit(1); // Exit the process if key is missing
}

// --- Chat Endpoint ---
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
        return res.status(400).json({ error: 'Message content is required and must be a non-empty string.' });
    }

    console.log(`Received message: "${userMessage}"`);

    try {
        const groqResponse = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                messages: [
                    {
                        role: 'system',
                        content: 'You are a friendly and helpful AI assistant. Keep your responses concise and to the point.'
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                model: 'llama3-8b-8192', // Or another suitable GROQ model
                temperature: 0.7,
                max_tokens: 200,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                }
            }
        );

        // Extract the AI's message
        const aiReply = groqResponse.data.choices[0]?.message?.content;

        if (aiReply) {
            res.json({ reply: aiReply });
        } else {
            console.error('GROQ API response missing content:', groqResponse.data);
            res.status(500).json({ error: 'Failed to get a valid response from the AI.' });
        }

    } catch (error) {
        console.error('Error contacting GROQ API:', error.response?.data || error.message);
        res.status(500).json({
            error: 'An error occurred while processing your request. Please try again.',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
