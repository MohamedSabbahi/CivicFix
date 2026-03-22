const axios = require('axios');
const prisma = require('../utils/prisma');

// Maps Python AI output to the frontend UI categories and team emails
const departmentMap = {
    'ROADS_DEPT': { category: 'Road', depName: 'Roads & infrastructure', email: 'zakariaeelyaakoubi437@gmail.com' },
    'WASTE_DEPT': { category: 'Waste', depName: 'Sanitation & waste', email: 'mohamed.sabbahi21@gmail.com' },
    'PARKS_DEPT': { category: 'Hazard', depName: 'Parks & Green spaces', email: 'zakariae.elyaakoubi1@gmail.com' },
    'SAFETY_DEPT': { category: 'Public safety issue', depName: 'Public safety', email: 'hamzaair380@gmail.com' }
};

// In-memory state store for multi-step conversations
const activeConversations = {};

exports.handleChatMessage = async (req, res) => {
    try {
        // Fallback to a test user ID if auth middleware is not yet attached
        const userId = req.user ? req.user.id : "test_user_1"; 
        const userMessage = req.body.message;

        // ==========================================
        // PHASE 1: ONGOING CONVERSATIONS (State Machine)
        // ==========================================
        if (activeConversations[userId]) {
            let draft = activeConversations[userId];

            // --- STEP 2: Handle Description & Trigger LLM ---
            if (draft.step === "AWAITING_DESCRIPTION") {
                let finalDescription = userMessage; 

                try {
                    const hfResponse = await axios.post(
                        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
                        {
                            inputs: `[INST] You are a formal municipal assistant. Rewrite this citizen complaint into a professional, formal 2-sentence report description for the city database. Do not include any greetings, just the description. \nComplaint: "${userMessage}" [/INST]`,
                            parameters: { max_new_tokens: 100, return_full_text: false }
                        },
                        { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` } }
                    );
                    finalDescription = hfResponse.data[0].generated_text.trim();
                } catch (hfError) {
                    console.warn("LLM rewrite failed or timed out. Falling back to raw user text.");
                }

                draft.description = finalDescription;
                draft.step = "AWAITING_PHOTO"; 

                return res.json({ 
                    reply: `Got it. I've drafted the formal description. Finally, please upload a photo of the issue so the team can assess it. (Or type 'skip' if you don't have one).` 
                });
            }

            // --- STEP 3: Handle Photo & Save to Database ---
            if (draft.step === "AWAITING_PHOTO") {
                let finalPhotoUrl = null;
                
                // Frontend should send the hosted Supabase image URL as the message
                if (userMessage.toLowerCase() !== 'skip') {
                    finalPhotoUrl = userMessage; 
                }

                try {
                    await prisma.report.create({
                        data: {
                            title: draft.title,
                            description: draft.description,
                            category: draft.category,
                            status: "PENDING",
                            imageUrl: finalPhotoUrl,
                            userId: userId 
                        }
                    });
                } catch (dbError) {
                    console.error("Prisma Save Error:", dbError.message);
                    return res.status(500).json({ reply: "I processed your report, but had trouble saving it to the database. Please try again later." });
                }

                // Clear memory after successful submission
                delete activeConversations[userId]; 

                return res.json({ 
                    reply: `Perfect. I have formally submitted your report to the ${draft.depName} team. You can track its status in your dashboard.` 
                });
            }
        }

        // ==========================================
        // PHASE 2: NEW CONVERSATIONS (AI Routing)
        // ==========================================
        const pythonResponse = await axios.post(`${process.env.PYTHON_AI_URL}/parse`, {
            message: userMessage
        });

        const { intent, confidence, department } = pythonResponse.data;

        // Safety Net for low-confidence AI predictions
        if (confidence < 0.60) {
            return res.json({ reply: "I want to make sure I assist you correctly. Are you trying to report a new issue or check an existing ticket?" });
        }

        // ==========================================
        // PHASE 3: INTENT HANDLING
        // ==========================================
        if (intent === 'REPORT_ISSUE') {
            if (department && departmentMap[department]) {
                const mappedDept = departmentMap[department];
                
                // Initialize conversation state
                activeConversations[userId] = {
                    step: "AWAITING_DESCRIPTION",
                    title: userMessage.substring(0, 50), // Use first 50 chars as a draft title
                    category: mappedDept.category,
                    depName: mappedDept.depName,
                    email: mappedDept.email
                };
                
                return res.json({ reply: `I see you are reporting an issue for **${mappedDept.depName}**. Can you provide a brief description of the problem?` });
            } else {
                return res.json({ reply: "I can help you with that! Which department should this go to? (Roads, Waste, Parks, or Public Safety)" });
            }
        }

        if (intent === 'GET_STATS') {
            return res.json({ reply: "I'm pulling up the latest civic analytics for you now..." });
        }

        if (intent === 'CHECK_STATUS') {
            return res.json({ reply: "Let me check the status of your active reports." });
        }

    } catch (error) {
        console.error("Chatbot Controller Error:", error.message);
        res.status(500).json({ reply: "My AI connection is currently offline. Please try again later." });
    }
};