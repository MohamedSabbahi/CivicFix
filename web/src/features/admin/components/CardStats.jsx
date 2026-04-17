const CardStats = ({ icon, label, value, delta, deltaUp }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">

    {/* ICON + DELTA */}
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
        {icon ?? "📊"}
      </div>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
        ${deltaUp ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
        {delta ?? "—"}
      </span>
    </div>

    {/* LABEL EN HAUT — grand */}
    <div className="text-sm font-semibold text-white">
      {label ?? "Label"}
    </div>

    {/* VALUE EN BAS — grand chiffre */}
    <div className="text-3xl font-bold text-white">
      {value ?? "—"}
    </div>

  </div>
);

export default CardStats;