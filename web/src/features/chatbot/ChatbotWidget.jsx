import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, TrendingUp, CheckCircle, Clock, FileText } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useChatbot } from './useChatbot';

const TypingIndicator = () => (
    <div className="flex justify-start">
        <div className="bg-slate-800 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
            <div className="flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
            </div>
        </div>
    </div>
);

const QuickReplyCard = ({ onAnalytics, onReport }) => (
    <div className="bg-slate-800/60 border border-white/10 rounded-xl p-3 space-y-2">
        <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-3">Quick options</p>
        <button
            onClick={onAnalytics}
            className="w-full py-2.5 px-3 text-sm rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white transition text-left flex items-center gap-2"
        >
            <TrendingUp size={14} />
            View Analytics Summary
        </button>
        <button
            onClick={onReport}
            className="w-full py-2.5 px-3 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition text-left flex items-center gap-2"
        >
            <FileText size={14} />
            Report a Municipal Issue
        </button>
    </div>
);

const AnalyticsSummaryCard = ({ payload }) => {
    const { overview, departments } = payload;
    return (
        <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4 space-y-4">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">Municipal Analytics</p>

            {/* Overview grid */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900/60 rounded-lg p-2.5 text-center">
                    <p className="text-xl font-bold text-white">{overview.total}</p>
                    <p className="text-white/40 text-xs mt-0.5">Total Issues</p>
                </div>
                <div className="bg-emerald-950/60 rounded-lg p-2.5 text-center border border-emerald-500/20">
                    <p className="text-xl font-bold text-emerald-400">{overview.resolutionRate}</p>
                    <p className="text-white/40 text-xs mt-0.5">Resolution Rate</p>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2.5 flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-white">{overview.resolved}</p>
                        <p className="text-white/40 text-xs">Resolved</p>
                    </div>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2.5 flex items-center gap-2">
                    <Clock size={14} className="text-amber-400 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-white">{overview.inProgress}</p>
                        <p className="text-white/40 text-xs">In Progress</p>
                    </div>
                </div>
            </div>

            <p className="text-white/30 text-xs">
                <span className="text-blue-400 font-medium">{overview.todayCount}</span> new report{overview.todayCount !== 1 ? 's' : ''} submitted today
            </p>

            {/* Department list */}
            {departments?.length > 0 && (
                <div>
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-wide mb-2">By Department</p>
                    <div className="space-y-1.5">
                        {departments.map((d, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                                <span className="text-slate-300 truncate max-w-[55%]">{d.name}</span>
                                <div className="flex gap-3 text-right flex-shrink-0">
                                    <span className="text-emerald-400">{d.resolved} resolved</span>
                                    <span className="text-white/30">{d.avgTime}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ChatMessage = ({ msg, onFetchStats, onStartReport, onAnalytics, onReport }) => {
    if (msg.type === 'text') {
        return (
            <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                    msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-slate-800 text-slate-200 border border-white/10 rounded-bl-sm'
                }`}>
                    {msg.text}
                </div>
            </div>
        );
    }

    if (msg.type === 'quick_reply') {
        return <QuickReplyCard onAnalytics={onAnalytics} onReport={onReport} />;
    }

    if (msg.type === 'analytics_summary') {
        return <AnalyticsSummaryCard payload={msg.payload} />;
    }

    if (msg.type === 'stats_options') {
        return (
            <div className="bg-slate-800 border border-white/10 rounded-xl p-3 space-y-2">
                <p className="text-white/50 text-xs font-medium">Choose a report:</p>
                <button
                    onClick={() => onFetchStats('performance')}
                    className="w-full py-2 px-3 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition text-left"
                >
                    📊 Department Performance
                </button>
                <button
                    onClick={() => onFetchStats('resolution')}
                    className="w-full py-2 px-3 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition text-left"
                >
                    📈 Resolution Rates
                </button>
            </div>
        );
    }

    if (msg.type === 'report_action') {
        return (
            <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-xl p-3">
                <p className="text-emerald-400 text-xs font-semibold mb-2 uppercase tracking-wide">Issue detected</p>
                <p className="text-white text-sm font-medium">{msg.payload.title}</p>
                <p className="text-white/40 text-xs mt-0.5 mb-3">{msg.payload.category}</p>
                <button
                    onClick={() => onStartReport(msg.payload)}
                    className="w-full py-2 px-3 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
                >
                    📝 Start Report
                </button>
            </div>
        );
    }

    return null;
};

const ChatbotWidget = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const {
        messages, input, setInput, isLoading,
        inputRef, bottomRef,
        handleSend, handleFetchStats, handleStartReport,
        handleAnalyticsSummary, handleReportMode,
    } = useChatbot(isOpen);

    if (!user || location.pathname.startsWith('/admin')) return null;

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[360px] h-[540px] rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl shadow-black/60 flex flex-col overflow-hidden">

                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/80 border-b border-white/10 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <Bot size={15} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-white font-semibold text-sm">CivicFix Assistant</p>
                            <p className="text-white/40 text-xs">AI-powered civic helper</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="ml-auto text-white/40 hover:text-white transition flex-shrink-0"
                            aria-label="Close chat"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map(msg => (
                            <ChatMessage
                                key={msg.id}
                                msg={msg}
                                onFetchStats={handleFetchStats}
                                onStartReport={handleStartReport}
                                onAnalytics={handleAnalyticsSummary}
                                onReport={handleReportMode}
                            />
                        ))}
                        {isLoading && <TypingIndicator />}
                        <div ref={bottomRef} />
                    </div>

                    <div className="px-3 py-3 border-t border-white/10 flex items-center gap-2 flex-shrink-0">
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Describe an issue or ask for stats…"
                            disabled={isLoading}
                            className="flex-1 bg-slate-800 text-white text-sm rounded-xl px-4 py-2.5 border border-white/10 placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition disabled:opacity-50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white transition"
                            aria-label="Send message"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(o => !o)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/50 flex items-center justify-center transition-all duration-200 active:scale-95"
                aria-label={isOpen ? 'Close assistant' : 'Open AI assistant'}
            >
                {isOpen
                    ? <X size={22} className="text-white" />
                    : <MessageCircle size={22} className="text-white" />
                }
            </button>
        </>
    );
};

export default ChatbotWidget;
