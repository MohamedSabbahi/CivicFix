const statusStyles = {
    "PENDING":     "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    "IN_PROGRESS": "bg-blue-500/20   text-blue-400   border border-blue-500/30",
    "RESOLVED":    "bg-green-500/20  text-green-400  border border-green-500/30",
};

const ReportPhoto = ({ photoUrl, status }) => (
<div className="relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden h-[220px]">
    <div className="absolute top-4 left-4 z-10">
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusStyles[status]}`}>
        • {status?.replace("_", " ")}
        </span>
    </div>
    {photoUrl ? (
        <img
        src={`http://localhost:5001/uploads/${photoUrl.split('/').pop()}`}
        alt="report"
        className="w-full h-full object-cover"
        />
    ) : (
    <div className="w-full h-full flex items-center justify-center text-white/20 text-5xl">
        📷
    </div>
    )}
</div>
);

export default ReportPhoto;