const CardStats = ({ icon, label, value, delta, deltaUp }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">

    {/* ICON + DELTA */}
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
        {icon ?? "📊"}
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full
        ${deltaUp
          ? "bg-green-500/20 text-green-400"
          : "bg-red-500/20 text-red-400"
        }`}>
        {delta ?? "—"}
      </span>
    </div>

    {/* VALUE + LABEL */}
    <div>
      <div className="text-2xl font-bold text-white">
        {value ?? "—"}
      </div>
      <div className="text-xs text-white/50 mt-0.5">
        {label ?? "Label"}
      </div>
    </div>

  </div>
);

export default CardStats;