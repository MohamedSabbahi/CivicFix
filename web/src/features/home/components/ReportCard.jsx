const colors = {
  New: "bg-blue-500/20 text-blue-300",
  "In Progress": "bg-yellow-500/20 text-yellow-300",
  Resolved: "bg-green-500/20 text-green-300",
};

const ReportCard = ({ title, status }) => {
  return (
    <div className="flex items-center justify-between glass p-4">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-white/40">Downtown Area</p>
      </div>

      <span
        className={`px-3 py-1 text-xs rounded-full ${colors[status]}`}
      >
        {status}
      </span>
    </div>
  );
};

export default ReportCard;