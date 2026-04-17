const ReportResolutionTime = ({ createdAt, resolvedAt, status }) => {

const calcTime = () => {
    const start  = new Date(createdAt);
    const end    = resolvedAt ? new Date(resolvedAt) : new Date();
    const diffMs = end - start;
    const hours  = (diffMs / (1000 * 60 * 60)).toFixed(2);
    const days   = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const mins   = Math.floor(diffMs / (1000 * 60));
    return { hours, days, mins, diffMs };
};

const { hours, days, diffMs } = calcTime();

const config = {
    "PENDING":     { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", label: "Waiting",     icon: "⏳" },
    "IN_PROGRESS": { color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   label: "In Progress", icon: "🔄" },
    "RESOLVED":    { color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20",  label: "Resolved",    icon: "✅" },
    }[status] ?? { color: "text-white/50", bg: "bg-white/5", border: "border-white/10", label: status, icon: "📋" };

return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
    <h3 className="text-sm font-semibold text-white">Resolution Time</h3>

      {/* TEMPS PRINCIPAL */}
    <div className={`${config.bg} border ${config.border} rounded-xl p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
        <span className="text-2xl">{config.icon}</span>
        <div>
            <p className={`text-2xl font-bold ${config.color}`}>
                {hours} <span className="text-sm font-normal">hours</span>
            </p>
            <p className="text-xs text-white/40">
                {status === "RESOLVED" ? "Total resolution time" : "Time elapsed"}
            </p>
        </div>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
        {config.label}
        </span>
    </div>

      {/* DATES */}
        <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
            <span className="text-white/40">Submitted</span>
            <span className="text-white/70">{new Date(createdAt).toLocaleString()}</span>
        </div>
        {status === "RESOLVED" && resolvedAt ? (
            <div className="flex items-center justify-between text-xs">
            <span className="text-white/40">Resolved at</span>
            <span className="text-green-400">{new Date(resolvedAt).toLocaleString()}</span>
            </div>
        ) : (
            <div className="flex items-center justify-between text-xs">
            <span className="text-white/40">Status</span>
            <span className="text-white/40">Not resolved yet</span>
            </div>
        )}
    </div>

      {/* PROGRESS BAR — seulement si pas encore résolu */}
        {status !== "RESOLVED" && (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-white/30">
            <span>0h</span>
            <span>72h max</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
            <div
                className={`h-1.5 rounded-full ${status === "IN_PROGRESS" ? "bg-blue-500" : "bg-yellow-500"}`}
              style={{ width: `${Math.min((diffMs / (1000 * 60 * 60 * 72)) * 100, 100)}%` }}
            />
        </div>
        </div>
    )}

    </div>
);
};

export default ReportResolutionTime;