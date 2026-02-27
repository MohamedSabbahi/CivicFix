const StatCard = ({ title, value, subtitle, highlight, success, glow }) => {
  return (
    <div
      className={`glass p-5 relative overflow-hidden ${
        glow && "shadow-[0_0_40px_rgba(59,130,246,0.3)]"
      }`}
    >
      <h4 className="text-sm text-white/60">{title}</h4>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-xs text-white/40 mt-1">{subtitle}</p>

      {highlight && (
        <div className="absolute inset-0 bg-yellow-500/10 pointer-events-none" />
      )}
      {success && (
        <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />
      )}
    </div>
  );
};

export default StatCard;