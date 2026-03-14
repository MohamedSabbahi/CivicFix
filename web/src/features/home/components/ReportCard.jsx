const colors = {
  New: "bg-blue-500/80 text-white border-blue-400/50",
  "In Progress": "bg-yellow-600/80 text-white border-yellow-500/50",
  Resolved: "bg-green-600/80 text-white border-green-500/50",
};

const ReportCard = ({ title, status, address, date, image, onView }) => {
  return (
    <div
      className="
        relative flex items-center gap-4 p-4
        rounded-2xl
        bg-white/[0.09]
        border border-white/[0.08]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_0_0_20px_rgba(59,130,246,0.05)]
        hover:border-white/[0.35]
        hover:bg-white/[0.15]
        hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),_0_0_30px_rgba(59,130,246,0.1)]
        transition-all duration-300
      "
    >
      {/* Thumbnail */}
      <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-slate-800/40" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-base leading-tight">{title}</p>
        <p className="text-xs text-white/50 mt-0.5">{address || "Downtown Area"}</p>
        <p className="text-xs text-white/30 mt-1 flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm border border-white/20 inline-flex items-center justify-center text-[8px]">📅</span>
          {date || "Mar 26, 2026"}
        </p>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span
          className={`
            px-4 py-1.5 text-xs font-semibold rounded-full
            border
            ${colors[status]}
          `}
        >
          {status}
        </span>
        <button 
          onClick={onView}
          className="text-xs text-white/30 cursor-pointer hover:text-white/60 transition"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ReportCard;