const axios = require('axios');

exports.handleChatMessage = async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).json({ bot_reply: "Message cannot be empty." });
        }

        // Validate AI service configuration
        if (!process.env.PYTHON_AI_URL) {
            console.error("FATAL: PYTHON_AI_URL is missing from environment variables!");
            return res.status(500).json({ 
                intent: "UNKNOWN",
                bot_reply: "AI Server configuration error." 
            });
        }

        // Forward message to the Python/FastAPI microservice
        const pythonResponse = await axios.post(`${process.env.PYTHON_AI_URL}/parse`, {
            message: userMessage
        });

        // Return the parsed JSON response to the client
        return res.json(pythonResponse.data);

    } catch (error) {
        console.error("Chatbot Controller Error:", error.message);
        
        // Provide a structured fallback response matching the expected schema
        res.status(500).json({ 
            intent: "UNKNOWN",
            confidence: 0,
            bot_reply: "My AI connection is currently offline. Please try again later or use the manual report button.",
            category: "UNKNOWN",
            title: null,
            description: null,
            requires_photo: false 
        });
    }
};