import { useState, useEffect } from "react";
import { getComments, addComment, deleteComment } from "../../services/adminService";

const ReportComments = ({ reportId }) => {
const [comments, setComments] = useState([]);
const [text,     setText]     = useState("");
const [loading,  setLoading]  = useState(true);

useEffect(() => {
getComments(reportId)
    .then(res => {
      setComments(res.data.data ?? []); // ← .data.data
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
}, [reportId]);

const handleAdd = async () => {
    if (!text.trim()) return;
    try {
    const res = await addComment(reportId, text);
    setComments(prev => [...prev, res.data.data]); // ← .data.data
    setText("");
    } catch (err) {
    console.error("Add comment error:", err);
}
};

const handleDelete = async (commentId) => {
    try {
    await deleteComment(reportId, commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
    console.error("Delete comment error:", err);
    }
};

if (loading) return (
    <p className="text-white/30 text-sm">Loading comments...</p>
);

return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
    <h3 className="text-sm font-semibold text-white">Comments</h3>

      {/* LISTE */}
    <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {comments.length === 0 ? (
            <p className="text-white/30 text-xs">No comments yet.</p>
        ) : (
            comments.map(c => (
            <div
                key={c.id}
                className="flex items-start justify-between gap-3 bg-white/5 rounded-xl px-4 py-3"
            >
            <div className="space-y-1">
                <p className="text-xs font-medium text-blue-400">
                    {c.user?.name ?? "Unknown"}
                </p>
                <p className="text-sm text-white/70">{c.text}</p>
                <p className="text-xs text-white/30">
                    {new Date(c.createdAt).toLocaleString()}
                </p>
            </div>
            <button
                onClick={() => handleDelete(c.id)}
                className="text-red-400/60 hover:text-red-400 transition text-xs shrink-0"
            >
                🗑️
            </button>
            </div>
        ))
        )}
    </div>

      {/* ADD COMMENT */}
    <div className="flex items-center gap-2 pt-2">
        <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="Add a comment..."
            className="flex-1 bg-white/10 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 placeholder-white/30"
        />
        <button
            onClick={handleAdd}
            className="text-sm px-4 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
        >
            Send
        </button>
    </div>

    </div>
);
};

export default ReportComments;