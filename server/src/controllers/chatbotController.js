const axios = require('axios');
const prisma = require('../utils/prisma');

// Bypasses Groq entirely — reads directly from the DB and returns pre-aggregated analytics
exports.getAnalyticsSummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [statusCounts, departments, todayCount] = await Promise.all([
            prisma.civicIssue.groupBy({ by: ['status'], _count: true }),
            prisma.department.findMany({
                include: {
                    interventions: {
                        where: { civicIssue: { status: 'RESOLVED' } },
                        include: {
                            civicIssue: { select: { createdAt: true, resolvedAt: true } }
                        }
                    }
                }
            }),
            prisma.civicIssue.count({ where: { createdAt: { gte: today } } }),
        ]);

        const total      = statusCounts.reduce((s, x) => s + x._count, 0);
        const resolved   = statusCounts.find(s => s.status === 'RESOLVED')?._count    || 0;
        const inProgress = statusCounts.find(s => s.status === 'IN_PROGRESS')?._count || 0;
        const pending    = statusCounts.find(s => s.status === 'PENDING')?._count     || 0;

        const deptStats = departments
            .filter(d => d.interventions.length > 0)
            .map(dept => {
                const times = dept.interventions
                    .filter(i => i.civicIssue?.resolvedAt)
                    .map(i => (new Date(i.civicIssue.resolvedAt) - new Date(i.civicIssue.createdAt)) / 3600000);
                return {
                    name:     dept.name,
                    resolved: dept.interventions.length,
                    avgTime:  times.length > 0
                        ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) + 'h'
                        : '—',
                };
            })
            .sort((a, b) => b.resolved - a.resolved);

        return res.json({
            overview: { total, resolved, inProgress, pending, todayCount,
                resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) + '%' : '0%' },
            departments: deptStats,
        });
    } catch (error) {
        console.error('Analytics Summary Error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics summary' });
    }
};

// Fire-and-forget ping to wake the Python service before the user sends a message
exports.warmupAiService = async (req, res) => {
    res.json({ status: 'warmup_initiated' });
    if (process.env.PYTHON_AI_URL) {
        axios.get(`${process.env.PYTHON_AI_URL}/health`, { timeout: 65000 }).catch(() => {});
    }
};

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
        // 65s timeout: Render free tier cold starts take up to 60s
        const pythonResponse = await axios.post(`${process.env.PYTHON_AI_URL}/parse`, {
            message: userMessage
        }, { timeout: 65000 });

        // Return the parsed JSON response to the client
        return res.json(pythonResponse.data);

    } catch (error) {
        if (error.response) {
            console.error("Chatbot AI Error — Python service responded with:", error.response.status, JSON.stringify(error.response.data));
        } else if (error.code === 'ECONNABORTED') {
            console.error("Chatbot Timeout: AI service did not respond within 15 seconds.");
        } else {
            console.error("Chatbot Controller Error:", error.code || error.message);
        }
        
        // Return 200 so the frontend receives the bot_reply gracefully instead of throwing
        res.json({
            intent: "UNKNOWN",
            confidence: 0,
            bot_reply: "My AI assistant is temporarily offline (the service may be waking up). Please try again in 30 seconds, or describe your issue directly and I'll do my best.",
            category: "UNKNOWN",
            title: null,
            description: null,
            requires_photo: false
        });
    }
};