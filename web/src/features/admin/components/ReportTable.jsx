import { useNavigate } from "react-router-dom";

const statusStyles = {
  "PENDING":     "text-yellow-400",
  "IN_PROGRESS": "text-blue-400",
  "RESOLVED":    "text-green-400",
};

const statusDot = {
  "PENDING":     "bg-yellow-400",
  "IN_PROGRESS": "bg-blue-400",
  "RESOLVED":    "bg-green-400",
};

const ReportTable = ({ reports = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {reports.length === 0 ? (
        <div className="text-center text-white/30 text-sm py-10">
          Aucun rapport trouvé
        </div>
      ) : (
        reports.map(r => (
          <div
            key={r.id}
            onClick={() => navigate(`/admin/reports/${r.id}`)}
            className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 cursor-pointer hover:bg-white/10 transition flex items-center gap-4"
          >
            {/* PHOTO */}
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white/10">
              {r.photoUrl ? (
                <img
                  src={`http://localhost:5001/uploads/${r.photoUrl.split('/').pop()}`}
                  alt={r.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20 text-xl">
                  📷
                </div>
              )}
            </div>

            {/* BARRE */}
            <div className="w-1 rounded-full bg-blue-500 shrink-0 self-stretch" />

            {/* INFOS */}
            <div className="flex-1 space-y-1  min-w-0">
              <p className="text-sm font-semibold text-white">{r.title}</p>
              <p className="text-xs text-white/50 truncate">{r.description}</p>
              <div className="flex items-center gap-4 text-xs text-white/30 mt-1">
                {r.category?.name && <span>📍 {r.category.name}</span>}
                {r.createdAt && (
                  <span>📅 {new Date(r.createdAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${statusDot[r.status] ?? "bg-white/30"}`} />
              <span className={`text-xs font-medium ${statusStyles[r.status] ?? "text-white/50"}`}>
                {r.status?.replace("_", " ") ?? "PENDING"}
              </span>
            </div>

          </div>
        ))
      )}
    </div>
  );
};

export default ReportTable;