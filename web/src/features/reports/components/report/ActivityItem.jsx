// ActivityItem - Reusable activity feed row component
const ActivityItem = ({ icon, title, sub, time, color }) => (
  <div className="flex items-start gap-3 group">
    <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white/90 truncate">{title}</p>
      <p className="text-xs text-white/40 truncate">{sub}</p>
    </div>
    <span className="text-[10px] text-white/30 flex-shrink-0 mt-0.5">{time}</span>
  </div>
);

export default ActivityItem;

