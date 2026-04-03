const axios = require('axios');

exports.handleChatMessage = async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).json({ reply: "Message cannot be empty." });
        }

        // 1. Safety check for your environment variable
        if (!process.env.PYTHON_AI_URL) {
            console.error("FATAL: PYTHON_AI_URL is missing from environment variables!");
            return res.status(500).json({ reply: "AI Server configuration error." });
        }

        // 2. Forward the user's message to your Python/Groq AI microservice
        const pythonResponse = await axios.post(`${process.env.PYTHON_AI_URL}/parse`, {
            message: userMessage
        });

        // 3. The Python service returns a clean JSON object: 
        // { intent: "...", department: "...", requires_photo: true/false, reply: "..." }
        // We pass this exact object straight back to the React Native app!
        return res.json(pythonResponse.data);

    } catch (error) {
        console.error("Chatbot Controller Error:", error.message);
        
        // Return a safe fallback response so the mobile app handles it gracefully
        res.status(500).json({ 
            intent: "UNKNOWN",
            reply: "My AI connection is currently offline. Please try again later." 
        });
    }
};