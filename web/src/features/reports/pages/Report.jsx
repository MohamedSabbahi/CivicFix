import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import api from "../../../services/api";
import Sidebar from "../../home/components/Sidebar";
import { FileText, MapPin, Calendar, Clock, Plus, Search, CheckCircle,AlertCircle, Eye, Edit,Trash2 } from "lucide-react";
import background from "../../../assets/background-dashbord.png";

const statusConfig = {
  NEW: { color: "bg-blue-500", text: "text-blue-400", label: "New", dot: "bg-blue-400" },
  IN_PROGRESS: { color: "bg-yellow-500", text: "text-yellow-400", label: "In Progress", dot: "bg-yellow-400" },
  RESOLVED: { color: "bg-green-500", text: "text-green-400", label: "Resolved", dot: "bg-green-400" },
};

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

const StatCard = ({ title, value, subtitle, highlight, success, glow }) => (
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

const ReportCard = ({ report, onView, onEdit, onDelete }) => {
  const status = statusConfig[report.status] || statusConfig.NEW;

  return (
    <div className="group relative p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className={`w-1 h-12 rounded-full ${status.color} flex-shrink-0`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium truncate">{report.title}</h4>
              <p className="text-white/40 text-sm mt-0.5 truncate">{report.description}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-white/[0.05] ${status.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {report.category?.name || "Uncategorized"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onView(report)} className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-blue-400 transition">
            <Eye size={16} />
          </button>
          <button onClick={() => onEdit(report)} className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-yellow-400 transition">
            <Edit size={16} />
          </button>
          <button onClick={() => onDelete(report)} className="p-2 rounded-lg bg-white/[0.06] hover:bg-red-500/20 text-white/60 hover:text-red-400 transition">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Reports = () => { 
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const navigate = useNavigate(); 

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await api.get("/reports");
      setReports(data.data || []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === "all" || report.status === filter.toUpperCase();
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: reports.length,
    new: reports.filter(r => r.status === "NEW").length,
    inProgress: reports.filter(r => r.status === "IN_PROGRESS").length,
    resolved: reports.filter(r => r.status === "RESOLVED").length,
  };

  const handleViewReport = (report) => {
    navigate(`/reports/${report.id}`);
  };

  const handleCreateNew = () => {
    navigate("/create-report"); 
  };

  const handleDeleteReport = async (report) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await api.delete(`/reports/${report.id}`);
        setReports(reports.filter(r => r.id !== report.id));
      } catch (err) {
        console.error("Failed to delete:", err);
      }
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${background})` }} />
      <div className="fixed inset-0 bg-[#020617]/80" />

      <div className="relative z-10 flex">
        <Sidebar />

        <main className="flex-1 ml-[260px] mr-[320px] p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Reports</h1>
              <p className="text-white/40 mt-1">Manage your civic reports</p>
            </div>
            <button 
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all shadow-lg shadow-blue-500/25"
            >
              <Plus size={18} /> New Report
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <StatCard title="Total" value={stats.total} subtitle="All time" />
            <StatCard title="New" value={stats.new} subtitle="Pending" highlight />
            <StatCard title="In Progress" value={stats.inProgress} subtitle="Active" />
            <StatCard title="Resolved" value={stats.resolved} subtitle="Completed" success />
          </div>

          <div className="flex items-center justify-between gap-4 bg-white/[0.02] p-2 rounded-2xl border border-white/5">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'new', 'in_progress', 'resolved'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                    filter === f ? "bg-blue-500 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pb-10">
            {loading ? (
              <div className="text-center py-20 opacity-50">Loading reports...</div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                <FileText size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-white/20">No reports found matching your criteria</p>
              </div>
            ) : (
              filteredReports.map(report => (
                <ReportCard 
                  key={report.id} 
                  report={report} 
                  onView={handleViewReport} 
                  onEdit={() => navigate(`/edit-report/${report.id}`)}
                  onDelete={handleDeleteReport}
                />
              ))
            )}
          </div>
        </main>

        {/* RIGHT PANEL     */}
        <aside className="fixed right-6 top-8 bottom-8 w-72 space-y-4">
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Quick Actions</h3>
            <button onClick={handleCreateNew} className="w-full py-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-bold transition flex items-center justify-center gap-2 mb-2">
                <Plus size={16}/> Create Report
            </button>
            <button onClick={() => navigate('/map')} className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-bold transition flex items-center justify-center gap-2">
                <MapPin size={16}/> Explore Map
            </button>
          </div>

          <div className="flex-1 p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl overflow-hidden">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Live Updates</h3>
            <div className="space-y-4">
              {reports.slice(0, 4).map((r, i) => (
                <ActivityItem 
                  key={i}
                  icon={<Clock size={14}/>}
                  title={r.title}
                  sub={r.status}
                  time="Just now"
                  color={statusConfig[r.status]?.text}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Reports;