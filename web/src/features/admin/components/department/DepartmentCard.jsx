import { useState } from "react";
import EditDepartmentModal from "./EditDepartmentModal";

const icons = {
  "Roads & infrastructure": "🛣️",
  "Sanitation & waste": "🗑️",
  "Public safety": "🚨",
  "Parks & Green spaces": "🌳",
};

const DepartmentCard = ({ department, onDelete, onUpdate }) => {
  const [showAllCats, setShowAllCats] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [currentDept, setCurrentDept] = useState(department);

  const visibleCats = showAllCats
    ? currentDept.categories
    : currentDept.categories?.slice(0, 3);

  const handleSave = (updated) => {
    setCurrentDept(updated);
    if (onUpdate) onUpdate(updated);
  };

  return (
    <>
      {showEdit && (
        <EditDepartmentModal
          department={currentDept}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
        />
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:bg-white/8 transition">

        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">
            {icons[currentDept.name] ?? "🏢"}
          </div>
          <button
            onClick={() => onDelete(currentDept.id)}
            className="text-white/20 hover:text-red-400 transition p-1"
          >
            🗑️
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">{currentDept.name}</h3>
          <a 
            href={"https://mail.google.com/mail/?view=cm&to=" + currentDept.email}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition"
          >
            {currentDept.email}
          </a>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-white/30 uppercase tracking-widest">Categories</p>
          <div className="flex flex-wrap gap-2">
            {visibleCats?.map(c => (
              <span key={c.id} className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/70">
                {c.name}
              </span>
            ))}
            {currentDept.categories?.length > 3 && (
              <button
                onClick={() => setShowAllCats(prev => !prev)}
                className="text-xs px-3 py-1 rounded-full bg-white/10 text-blue-400 hover:bg-white/20 transition"
              >
                {showAllCats ? "Show less" : "+" + (currentDept.categories.length - 3) + " more"}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-xs text-white/30">
            {currentDept.categories?.length ?? 0} categories
          </span>
          <button
            onClick={() => setShowEdit(true)}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition"
          >
            EDIT →
          </button>
        </div>

      </div>
    </>
  );
};

export default DepartmentCard;