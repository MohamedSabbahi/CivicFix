import { useState }        from "react";
import { useNavigate }     from "react-router-dom";
import { Search }          from "lucide-react";

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

const AnalyticsSearch = ({ reports = [] }) => {
const navigate        = useNavigate();
const [search, setSearch] = useState("");

const filtered = reports.filter(r =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase()) ||
    r.category?.name?.toLowerCase().includes(search.toLowerCase())
);

return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">

      {/* HEADER */}
    <h3 className="text-sm font-semibold text-white">Search Reports</h3>

      {/* SEARCH BAR */}
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
        <Search size={14} className="text-white/40 shrink-0" />
        <input
            type="text"
            placeholder="Search by title, description or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
        />
        {search && (
        <button
            onClick={() => setSearch("")}
            className="text-white/30 hover:text-white transition text-xs"
        >
            ✕
        </button>
        )}
    </div>

      {/* RESULTS */}
    {search && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filtered.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">
                No reports found for "{search}"
            </p>
        ) : (
            <>
            <p className="text-xs text-white/30">{filtered.length} result(s)</p>
            {filtered.map(r => (
                <div
                    key={r.id}
                    onClick={() => navigate(`/admin/reports/${r.id}`)}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:bg-white/10 transition"
                >
                  {/* PHOTO */}
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/10">
                    {r.photoUrl ? (
                    <img
                        src={`http://localhost:5001/uploads/${r.photoUrl.split('/').pop()}`}
                        alt={r.title}
                        className="w-full h-full object-cover"
                    />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                        📷
                    </div>
                    )}
                </div>

                  {/* INFO */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.title}</p>
                    <p className="text-xs text-white/40 truncate">{r.category?.name}</p>
                </div>

                  {/* STATUS */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot[r.status] ?? "bg-white/30"}`} />
                    <span className={`text-xs ${statusStyles[r.status] ?? "text-white/50"}`}>
                        {r.status?.replace("_", " ")}
                    </span>
                    </div>

                </div>
            ))}
            </>
        )}
        </div>
    )}

    </div>
);
};

export default AnalyticsSearch;