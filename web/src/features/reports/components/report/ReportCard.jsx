// ReportCard - Single report row component with action buttons
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { statusConfig } from './reportConstants';

const ReportCard = ({ report, onView, onEdit, onDelete }) => {
  const status = statusConfig[report.status] || statusConfig.NEW;
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/reports/${report.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className={`w-1 h-12 rounded-full ${status.bg} flex-shrink-0`} />
        
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
          <button 
            onClick={(e) => { e.stopPropagation(); onView(report); }} 
            className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-blue-400 transition"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(report); }} 
            className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-yellow-400 transition"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(report); }} 
            className="p-2 rounded-lg bg-white/[0.06] hover:bg-red-500/20 text-white/60 hover:text-red-400 transition"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;

