import { useState }          from "react";
import CardStats             from "../components/CardStats";
import ReportTable           from "../components/ReportTable";
import LiveMap               from "../components/LiveMap";
import { useAdminContext }   from "../context/AdminContext";
import { Search }            from "lucide-react";

const ITEMS_PER_PAGE = 3;
const filters = ["ALL", "PENDING", "IN_PROGRESS", "RESOLVED"];

const AdminDashboard = () => {
  const { reports, stats, loading } = useAdminContext();
  const [page,   setPage]   = useState(1);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("ALL");

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <p className="text-white/40 text-sm">Loading...</p>
    </div>
  );

  const filtered = reports
    .filter(r => active === "ALL" || r.status === active)
    .filter(r => r.title?.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleFilter = (val) => { setActive(val); setPage(1); };

  return (
    <div className="space-y-6">

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4">
        <CardStats icon="📋" label="Total"       value={stats?.totalReports      ?? "—"} delta={`+${stats?.totalReports ?? 0}`} deltaUp={true} />
        <CardStats icon="🆕" label="Pending"     value={stats?.pendingReports    ?? "—"} delta="PENDING"                        deltaUp={true} />
        <CardStats icon="🔄" label="In Progress" value={stats?.inProgressReports ?? "—"} delta="ACTIVE"                         deltaUp={true} />
        <CardStats icon="✅" label="Resolved"    value={stats?.resolvedReports   ?? "—"} delta="DONE"                           deltaUp={true} />
      </div>

      {/* SEARCH + FILTERS */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex-1">
          <Search size={14} className="text-white/40" />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`text-xs px-4 py-2 rounded-lg transition font-medium
                ${active === f
                  ? "bg-blue-500 text-white"
                  : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10"
                }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE + MAP */}
      <div className="grid grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <ReportTable reports={paginated} />
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-white/30">
                Page {page} of {totalPages} — {filtered.length} reports
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 disabled:opacity-30 transition"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`text-xs w-7 h-7 rounded-lg transition
                      ${page === n
                        ? "bg-blue-500 text-white"
                        : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10"
                      }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 disabled:opacity-30 transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="sticky top-6">
          <LiveMap reports={paginated} />
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;