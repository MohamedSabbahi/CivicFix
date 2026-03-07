// StatCard - Reusable stat display card component
const StatCard = ({ title, value, subtitle, highlight, success, glow }) => {
  return (
    <div className={`relative p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md overflow-hidden ${
      highlight ? "ring-1 ring-yellow-400/30" : success ? "ring-1 ring-green-400/30" : ""
    }`}>
      {glow && <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 blur-3xl" />}
      <div className="relative z-10">
        <p className="text-xs text-white/40 uppercase tracking-wider">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${highlight ? "text-yellow-400" : success ? "text-green-400" : "text-white"}`}>
          {value}
        </p>
        <p className="text-xs text-white/40 mt-1">{subtitle}</p>
      </div>
    </div>
  );
};

export default StatCard;

