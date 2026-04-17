import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, MapPin, AlertCircle, Search } from 'lucide-react';
import Sidebar from '../../home/components/Sidebar';
import ReportCard from '../components/report/ReportCard';
import StatCard from '../components/report/StatCard';
import reportService from '../services/reportService';
import background from '../../../assets/background-dashbord.png';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

const PageShell = ({ children }) => (
  <div className="relative min-h-screen text-white">
    <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${background})` }} />
    <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
    <div className="fixed inset-0 bg-[#020617]/60" />
    <div className="relative z-10 flex">
      <Sidebar />
      <main className="flex-1 min-w-0 ml-[260px] p-8 lg:ml-[260px]">{children}</main>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
  </div>
);

const EmptyState = ({ onCreateReport }) => (
  <div className="text-center py-20 px-8 bg-white/[0.03] rounded-2xl border border-white/[0.08] backdrop-blur-md">
    <MapPin className="w-20 h-20 mx-auto mb-6 text-white/30" />
    <h3 className="text-2xl font-bold text-white mb-3">No reports yet</h3>
    <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
      You haven't submitted any reports yet. Create your first report to get started!
    </p>
    <button
      onClick={onCreateReport}
      className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-3 mx-auto"
    >
      <Plus size={20} />
      Create Your First Report
    </button>
  </div>
);

const ErrorState = ({ onRetry, message = 'Failed to load your reports. Please try again.' }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
    <p className="text-white/80 mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-medium rounded-xl transition-all"
    >
      Try Again
    </button>
  </div>
);

const MyReports = () => {
  const navigate = useNavigate();
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportService.getMyReports();
      console.log('API Response:', response);
      setMyReports(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch my reports:', err);
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = myReports.filter(report =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: myReports.length,
    pending: myReports.filter(r => r.status === 'PENDING').length,
    inProgress: myReports.filter(r => r.status === 'IN_PROGRESS').length,
    resolved: myReports.filter(r => r.status === 'RESOLVED').length,
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const handleCreateReport = () => {
    navigate('/create-report');
  };

  const handleRetry = () => {
    fetchMyReports();
  };

  const onView = (report) => {
    navigate(`/reports/${report.id}`);
  };

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
              My Reports
            </h1>
            <p className="text-white/60">All your submitted reports ({stats.total})</p>
          </div>
          <button
            onClick={handleCreateReport}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-2"
          >
            <Plus size={20} />
            New Report
          </button>
        </div>

        {/* Stats - Exact Dashboard design */}
        <div className="grid grid-cols-4 gap-6">
          <StatCard title="Total Reports" value={stats.total} subtitle="Your reports" />
          <StatCard title="Pending" value={stats.pending} subtitle="New" glow />
          <StatCard title="In Progress" value={stats.inProgress} subtitle="In Progress" highlight />
          <StatCard title="Resolved" value={stats.resolved} subtitle="Completed" success />
        </div>

        {/* Search Bar */}
        <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search your reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {loading && <LoadingSpinner />}
          {error && !loading && <ErrorState message={error} onRetry={handleRetry} />}
          {!loading && !error && (
            <>
              {filteredReports.length === 0 ? (
                <EmptyState onCreateReport={handleCreateReport} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredReports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onView={onView}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default MyReports;

