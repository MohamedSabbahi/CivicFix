import { useState } from "react";
import { addDepartment } from "../../services/adminService";

const AddDepartmentModal = ({ onClose, onAdd }) => {
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [catInput,   setCatInput]   = useState("");
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);

  const handleAddCat = () => {
    if (!catInput.trim()) return;
    setCategories(prev => [...prev, catInput.trim()]);
    setCatInput("");
  };

  const handleRemoveCat = (index) => {
    setCategories(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name || !email) return;
    try {
      setLoading(true);
      const res = await addDepartment({ name, email, categories });
      onAdd(res.data.data);
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

        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Add Department</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition">✕</button>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/40">Department Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Public Safety"
            className="w-full bg-white/10 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 placeholder-white/20"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/40">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="department@civicfix.com"
            className="w-full bg-white/10 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 placeholder-white/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/40">Categories</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={catInput}
              onChange={e => setCatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddCat()}
              placeholder="Add category..."
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
            {categories.map((c, i) => (
              <span key={i} className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">
                {c}
                <button onClick={() => handleRemoveCat(i)} className="hover:text-red-400">✕</button>
              </span>
            ))}
          </div>
        </div>

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
            {loading ? "Saving..." : "Add Department"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddDepartmentModal;