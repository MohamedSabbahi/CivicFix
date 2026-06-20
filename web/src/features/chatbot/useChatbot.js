import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { sendChatMessage } from '../../services/api';
import api from '../../services/api';

const makeId = () => `${Date.now()}-${Math.random()}`;

export const useChatbot = (isOpen) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const firstName = user?.name?.split(' ')[0] || 'Citizen';
    const bottomRef = useRef(null);

    const [messages, setMessages] = useState(() => [{
        id: makeId(),
        text: `Hi ${firstName}! I'm the CivicFix AI. Describe a municipal issue to report it, or ask me for city statistics.`,
        sender: 'bot',
        type: 'text',
    }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const addMessages = useCallback((msgs) => {
        setMessages(prev => [...prev, ...msgs]);
    }, []);

    const handleSend = useCallback(async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        addMessages([{ id: makeId(), text, sender: 'user', type: 'text' }]);
        setInput('');
        setIsLoading(true);

        try {
            const data = await sendChatMessage(text);
            const next = [{ id: makeId(), text: data.bot_reply, sender: 'bot', type: 'text' }];

            if (data.intent === 'GET_STATS') {
                next.push({ id: makeId(), sender: 'bot', type: 'stats_options' });
            }

            if (data.intent === 'REPORT_ISSUE' && data.requires_photo) {
                next.push({
                    id: makeId(),
                    sender: 'bot',
                    type: 'report_action',
                    payload: { category: data.category, title: data.title, description: data.description },
                });
            }

            addMessages(next);
        } catch {
            addMessages([{
                id: makeId(),
                text: "Sorry, I'm having trouble connecting right now. Please try again.",
                sender: 'bot',
                type: 'text',
            }]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, addMessages]);

    const handleFetchStats = useCallback(async (statType) => {
        setIsLoading(true);
        try {
            if (statType === 'performance') {
                const { data } = await api.get('/admin/stats/department');
                let text = '📊 Department Performance:\n\n';
                data.forEach(d => {
                    text += `🏢 ${d.department}\n✅ Resolved: ${d.resolvedCivicIssuesCount}\n⏱️ Avg Time: ${d.averageResolutionTime}\n\n`;
                });
                addMessages([{ id: makeId(), text: text.trim(), sender: 'bot', type: 'text' }]);
            } else {
                const { data } = await api.get('/chatbot/stats');
                const o = data.data;
                const text = `📈 Global Resolution Rates:\n\n📋 Total: ${o.totalCivicIssues}\n✅ Resolved: ${o.resolvedCivicIssues} (${o.resolutionRate})\n⏳ In Progress: ${o.inProgressCivicIssues}\n⏱️ Platform Avg: ${o.overallAverageTime}`;
                addMessages([{ id: makeId(), text, sender: 'bot', type: 'text' }]);
            }
        } catch {
            addMessages([{ id: makeId(), text: 'Failed to load statistics. Please try again.', sender: 'bot', type: 'text' }]);
        } finally {
            setIsLoading(false);
        }
    }, [addMessages]);

    const handleStartReport = useCallback((payload) => {
        navigate('/create-report', { state: { prefill: payload } });
    }, [navigate]);

    return { messages, input, setInput, isLoading, handleSend, handleFetchStats, handleStartReport, bottomRef };
};
