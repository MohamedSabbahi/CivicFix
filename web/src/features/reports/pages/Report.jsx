// Report.jsx - Reports list page (layout + wiring only)
import { useNavigate } from "react-router-dom"; 
import Sidebar from "../../home/components/Sidebar";
import { Search, Plus } from "lucide-react";
import background from "../../../assets/background-dashbord.png";

import useReports from "../hooks/useReports";
import StatCard from "../components/report/StatCard";
import ReportCard from "../components/report/ReportCard";
import ReportsSidebar from "../components/report/ReportsSidebar";

const Report = () => {
  const navigate = useNavigate();
  
  const { 
    filteredReports, 
    loading, 
    filter, 
    searchQuery, 
    stats,
    setFilter, 
    setSearchQuery,
    handleViewReport,
    handleDeleteReport,
    handleEditReport,
  } = useReports();

  const handleCreateNew = () => navigate("/create-report");
  const handleExploreMap = () => navigate("/map");

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${background})` }} />
      <div className="fixed inset-0 bg-[#020617]/80" />

      <div className="relative z-10 flex">
        <Sidebar />

        <main className="flex-1 ml-[260px] mr-[320px] p-8 space-y-6">
          {/* Header */}
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

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard title="Total" value={stats.total} subtitle="All time" />
            <StatCard title="New" value={stats.new} subtitle="Pending" highlight />
            <StatCard title="In Progress" value={stats.inProgress} subtitle="Active" />
            <StatCard title="Resolved" value={stats.resolved} subtitle="Completed" success />
          </div>

          {/* Search & Filter Bar */}
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

          {/* Reports List */}
          <div className="space-y-3 pb-10">
            {loading ? (
              <div className="text-center py-20 opacity-50">Loading reports...</div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                <p className="text-white/20">No reports found matching your criteria</p>
              </div>
            ) : (
              filteredReports.map(report => (
                <ReportCard 
                  key={report.id} 
                  report={report} 
                  onView={handleViewReport} 
                  onEdit={handleEditReport}
                  onDelete={handleDeleteReport}
                />
              ))
            )}
          </div>
        </main>

        {/* Sidebar */}
        <ReportsSidebar 
          reports={filteredReports}
          onCreateNew={handleCreateNew}
          onExploreMap={handleExploreMap}
        />
      </div>
    </div>
  );
};

export default Report;

