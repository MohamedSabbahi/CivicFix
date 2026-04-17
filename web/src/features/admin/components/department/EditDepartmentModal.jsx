import { useState } from "react";
import { updateDepartment } from "../../services/adminService";

const EditDepartmentModal = ({ department, onClose, onSave }) => {
const [name, setName]       = useState(department.name);
const [email, setEmail]     = useState(department.email);
const [catInput, setCatInput] = useState("");
const [catsToAdd, setCatsToAdd]       = useState([]);
const [catsToDelete, setCatsToDelete] = useState([]);
const [loading, setLoading] = useState(false);

const handleAddCat = () => {
    if (!catInput.trim()) return;
    setCatsToAdd(prev => [...prev, catInput.trim()]);
    setCatInput("");
};

const toggleDeleteCat = (id) => {
    setCatsToDelete(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
};

const handleSave = async () => {
    try {
        setLoading(true);
        const res = await updateDepartment(department.id, {
        name,
        email,
        categoriesToAdd:    catsToAdd,
        categoriesToDelete: catsToDelete,
    });
            onSave(res.data.data);
            onClose();
    } catch (err) {
            console.error(err);
    } finally {
            setLoading(false);
    }
};

return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-lg space-y-4">

        {/* HEADER */}
        <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Edit Department</h3>
                <button onClick={onClose} className="text-white/40 hover:text-white transition">✕</button>
        </div>

        {/* NAME */}
        <div className="space-y-1">
        <label className="text-xs text-white/40">Department Name</label>
        <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-white/10 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        </div>

        {/* EMAIL */}
        <div className="space-y-1">
            <label className="text-xs text-white/40">Email</label>
                <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-white/10 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
        </div>

        {/* EXISTING CATEGORIES */}
        <div className="space-y-2">
        <label className="text-xs text-white/40">Existing Categories — click to delete</label>
        <div className="flex flex-wrap gap-2">
            {department.categories?.map(c => (
            <button
                key={c.id}
                onClick={() => toggleDeleteCat(c.id)}
                className={`text-xs px-3 py-1 rounded-full transition ${
                catsToDelete.includes(c.id)
                    ? "bg-red-500/30 text-red-400 line-through"
                    : "bg-white/10 text-white/70 hover:bg-red-500/20 hover:text-red-400"
                }`}
            >
                {c.name}
            </button>
            ))}
        </div>
        </div>

        {/* ADD NEW CATEGORIES */}
        <div className="space-y-2">
        <label className="text-xs text-white/40">Add New Categories</label>
        <div className="flex gap-2">
            <input
                type="text"
                value={catInput}
                onChange={e => setCatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddCat()}
                placeholder="New category..."
                className="flex-1 bg-white/10 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 placeholder-white/20"
            />
            <button
                onClick={handleAddCat}
                className="text-sm px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition"
            >
                + Add
            </button>
        </div>
        <div className="flex flex-wrap gap-2">
            {catsToAdd.map((c, i) => (
            <span key={i} className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">
                {c}
                <button onClick={() => setCatsToAdd(prev => prev.filter((_, j) => j !== i))} className="hover:text-red-400">✕</button>
            </span>
            ))}
        </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 pt-2">
        <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition"
        >
            Cancel
        </button>
        <button
            onClick={handleSave}
            disabled={loading || !name || !email}
            className="text-sm px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-50"
        >
            {loading ? "Saving..." : "Save Changes"}
        </button>
        </div>

    </div>
    </div>
);
};

export default EditDepartmentModal;