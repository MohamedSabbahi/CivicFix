import { useState } from "react";
import { editReport } from "../../services/adminService";

const ReportEditModal = ({ report, onClose, onSave }) => {
const [title,       setTitle]       = useState(report.title);
const [description, setDescription] = useState(report.description);
const [loading,     setLoading]     = useState(false);

const handleSave = async () => {
    try {
    setLoading(true);
    await editReport(report.id, { title, description });
    onSave({ title, description });
    onClose();
    } catch (err) {
    console.error("Edit error:", err);
    } finally {
    setLoading(false);
    }
};

return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-lg space-y-4">

        {/* HEADER */}
        <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Edit Report</h3>
        <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition text-lg"
        >
            ✕
        </button>
        </div>

        {/* TITLE */}
        <div className="space-y-1">
        <label className="text-xs text-white/40">Title</label>
        <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-white/10 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-1">
        <label className="text-xs text-white/40">Description</label>
        <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-white/10 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
        />
        </div>

        {/* BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
        <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition"
        >
            Cancel
        </button>
        <button
            onClick={handleSave}
            disabled={loading}
            className="text-sm px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-50"
        >
            {loading ? "Saving..." : "Save Changes"}
        </button>
        </div>

    </div>
    </div>
);
};

export default ReportEditModal;