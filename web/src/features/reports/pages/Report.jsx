import { useNavigate } from "react-router-dom"; 
import { motion } from 'framer-motion';
import { Plus, Loader2, MapPin } from "lucide-react";
import Sidebar from "../../home/components/Sidebar";
import background from "../../../assets/background-dashbord.png";

import useReports from "../hooks/useReports";
import ReportCard from "../components/report/ReportCard";

const Report = () => {
  const navigate = useNavigate();
  
  const { 
    reports, 
    loading,
    handleViewReport,
  } = useReports();

  const handleCreateNew = () => navigate("/create-report");

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${background})` }} />
      <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      <div className="fixed inset-0 bg-[#020617]/60" />
      <div className="relative z-10 flex">
        <Sidebar />
        <main className="flex-1 min-w-0 ml-[260px] p-8 lg:ml-[260px]">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
                All Reports
              </h1>
              <p className="text-white/60">All civic reports ({reports.length})</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateNew}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-2"
            >
              <Plus size={20} />
              New Report
            </motion.button>
          </motion.div>

          {/* Reports Grid */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-20 px-8 bg-white/[0.03] rounded-2xl border border-white/[0.08] backdrop-blur-md">
                <MapPin className="w-20 h-20 mx-auto mb-6 text-white/30" />
                <h3 className="text-2xl font-bold text-white mb-3">No reports found</h3>
                <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
                  No reports available
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onView={handleViewReport}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Report;

