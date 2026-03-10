// ReportsSidebar - Right panel with quick actions and live activity updates
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Clock } from 'lucide-react';
import ActivityItem from './ActivityItem';
import { statusConfig } from './reportConstants';

const ReportsSidebar = ({ reports, onCreateNew, onExploreMap }) => {
  const navigate = useNavigate();
  
  // Get top 4 recent reports for activity feed
  const recentReports = reports.slice(0, 4);

  const handleReportClick = (reportId) => {
    navigate(`/reports/${reportId}`);
  };

  return (
    <aside className="fixed right-6 top-8 bottom-8 w-72 space-y-4">
      {/* Quick Actions Panel */}
      <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Quick Actions</h3>
        <button 
          onClick={onCreateNew} 
          className="w-full py-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-bold transition flex items-center justify-center gap-2 mb-2"
        >
          <Plus size={16}/> Create Report
        </button>
        <button 
          onClick={onExploreMap} 
          className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-bold transition flex items-center justify-center gap-2"
        >
          <MapPin size={16}/> Explore Map
        </button>
      </div>

      {/* Live Updates Panel */}
      <div className="flex-1 p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl overflow-hidden">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Live Updates</h3>
        <div className="space-y-4">
          {recentReports.map((r, i) => {
            const status = statusConfig[r.status] || statusConfig.NEW;
            return (
              <div 
                key={i} 
                onClick={() => handleReportClick(r.id)}
                className="cursor-pointer"
              >
                <ActivityItem 
                  icon={<Clock size={14}/>}
                  title={r.title}
                  sub={status.label}
                  time="Just now"
                  color={status.text}
                />
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default ReportsSidebar;

