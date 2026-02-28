const cardConfig = {
  default: {
    icon: "🏠",
    iconBg: "bg-blue-500/20",
    accent: "from-blue-400/10",
    valueColor: "text-white",
  },
  highlight: {
    icon: "⚡",
    iconBg: "bg-yellow-500/20",
    accent: "from-yellow-400/10",
    valueColor: "text-yellow-300",
  },
  success: {
    icon: "✅",
    iconBg: "bg-green-500/20",
    accent: "from-green-400/10",
    valueColor: "text-green-300",
  },
  glow: {
    icon: "⭐",
    iconBg: "bg-blue-400/20",
    accent: "from-blue-300/10",
    valueColor: "text-blue-200",
  },
};

const StatCard = ({ title, value, subtitle, highlight, success, glow }) => {
  const variant = glow
    ? cardConfig.glow
    : highlight
    ? cardConfig.highlight
    : success
    ? cardConfig.success
    : cardConfig.default;

  return (
    <div
      className={`
        relative overflow-hidden p-5 rounded-2xl
        bg-white/[0.04]
        border border-white/[0.08]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_0_0_30px_rgba(59,130,246,0.08)]
        hover:bg-white/[0.07]
        hover:border-white/[0.15]
        transition-all duration-300
      `}
    >
      {/* Gradient accent */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${variant.accent} to-transparent pointer-events-none`}
      />

      {/* Content */}
      <div className="relative z-10">

        {/* Value + Label row */}
        <div className="flex items-baseline gap-3 mb-3">
          <span className={`text-4xl font-bold ${variant.valueColor}`}>
            {value}
          </span>
          <span className="text-sm font-medium text-white/60">{title}</span>
        </div>

        {/* Bottom row — icon + subtitle */}
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-sm ${variant.iconBg}`}>
            {variant.icon}
          </div>
          <span className="text-xs text-white/40">{subtitle}</span>
        </div>

      </div>
    </div>
  );
};

export default StatCard;