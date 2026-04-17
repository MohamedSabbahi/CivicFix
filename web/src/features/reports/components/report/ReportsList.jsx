// ReportsList - Sidebar list of reports on map page
import { MapPin } from 'lucide-react';
import { statusConfig } from './reportConstants';

const ReportsList = ({ reports, selectedReport, onReportClick }) => {
  return (
    <div className="w-80 flex flex-col rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Reports ({reports.length})</h3>
        </div>
        <p className="text-xs text-white/40">Click a marker on the map or browse below</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {reports.length === 0 ? (
          <div className="text-center py-8 text-white/30">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No reports found</p>
          </div>
        ) : (
          reports.map((report) => {
            const status = statusConfig[report.status] || statusConfig.PENDING;
            
            return (
              <div
                key={report.id}
                onClick={() => onReportClick(report)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  selectedReport?.id === report.id
                    ? 'bg-blue-500/20 border border-blue-500/40'
                    : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${status.dot}`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{report.title}</h4>
                    <p className="text-xs text-white/40 truncate mt-0.5">{report.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span 
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{ 
                          backgroundColor: `${status.color}20`,
                          color: status.color
                        }}
                      >
                        {status.label}
                      </span>
                      <span className="text-[10px] text-white/30">
                        {report.category?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReportsList;

