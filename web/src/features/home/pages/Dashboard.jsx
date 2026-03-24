import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import background from '../../../assets/background-dashbord.png';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import ReportCard from "../components/ReportCard";
import CityMap from "../components/CityMap";
import { getMyReports, getAllReports, getRecentReports } from "../services/homeService";

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
      <p className="text-red-400 mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [recentReports, setRecentReports] = useState([]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [myRes, allRes, recentRes] = await Promise.all([
        getMyReports(),
        getAllReports(),
        getRecentReports(),
      ]);

      setReports(allRes.data.data || []);
      setRecentReports(recentRes.data.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.response?.data?.message || 'Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const totalReports = reports.length;
  const inProgressCount = reports.filter(r => r.status === 'IN_PROGRESS').length;
  const resolvedCount = reports.filter(r => r.status === 'RESOLVED').length;

  const categories = ['Road', 'Waste', 'Hazard', 'Graffiti', 'Lighting'];

  const getFilteredReports = () => {
    let filtered = reports;
    if (filter !== 'all') {
      filtered = reports.filter(r => r.category?.name === filter);
    }
    return filtered.slice(0, 10);
  };

  const displayReports = getFilteredReports();

  const handleRetry = () => {
    fetchAllData();
  };

  const handleViewDetails = (reportId) => {
    navigate(`/reports/${reportId}`);
  };

  // ✅ Navigate to the Map page when "View Full Map" is clicked
  const handleViewFullMap = () => {
    navigate('/map');
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden">

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url(${background})` }}
      />

      {/* Dark cinematic tint */}
      <div className="absolute inset-0 bg-[#020617]/60" />

      {/* Soft vignette */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/50" />

      {/* Blue glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-blue-500/20 blur-[150px]" />

      <div className="relative z-10 flex">
        <Sidebar />

        {/* MAIN */}
        <main className="ml-[260px] p-6 space-y-6 w-full">
          <Header />

          {/* STATS */}
          <div className="grid grid-cols-4 gap-6">
            <StatCard title="Total Reports" value={loading ? '...' : totalReports} subtitle="Total Reports" />
            <StatCard title="Pending" value={loading ? '...' : totalReports - inProgressCount - resolvedCount} subtitle="Pending Reports" glow />
            <StatCard title="In Progress" value={loading ? '...' : inProgressCount} subtitle="In Progress" highlight />
            <StatCard title="Resolved" value={loading ? '...' : resolvedCount} subtitle="Resolved Reports" success />
          </div>

          {/* MAP */}
          <div className="relative p-5 h-[420px] rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            <h3 className="text-lg font-semibold mb-3">City Activity Overview</h3>
            <div className="h-[330px] rounded-xl overflow-hidden">
              {/* ✅ Pass handleViewFullMap so the button inside CityMap navigates to /map */}
              <CityMap onViewFullMap={handleViewFullMap} />
            </div>
          </div>

          {/* REPORTS */}
          <div className="space-y-3">

            {/* Header with filters */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold tracking-tight">All Reports</h3>
              <div className="flex items-center gap-5 text-sm">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex items-center gap-1.5 cursor-pointer transition ${filter === 'all' ? 'text-white font-semibold' : 'text-white/40 hover:text-white/70'}`}
                >
                  <span className="text-blue-400 text-base">♦</span> All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`cursor-pointer transition ${filter === category ? 'text-white font-semibold' : 'text-white/40 hover:text-white/70'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="py-8">
                <LoadingSpinner />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <ErrorMessage message={error} onRetry={handleRetry} />
            )}

            {/* Report Cards */}
            {!loading && !error && (
              <>
                {displayReports.length > 0 ? (
                  displayReports.map((report) => {
                    console.log("image field:", report.photoUrl);
                    return (
                      <ReportCard
                        key={report.id}
                        title={report.title}
                        status={report.status === 'IN_PROGRESS' ? 'In Progress' : report.status}
                        address={report.category?.name || "Downtown Area"}
                        date={formatDate(report.createdAt)}
                        image={report.photoUrl ? `${API_BASE_URL}${report.photoUrl}` : null}
                        onView={() => handleViewDetails(report.id)}
                      />
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-white/40 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                    No reports yet. Create your first report to get started!
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;