import { memo } from 'react';
import { MapPin, User, Calendar, Clock } from 'lucide-react';
import { formatDate } from '../utils/reportUtils';

const ReportInfoCard = memo(({ report }) => (
  <section
    className="bg-white/[0.02] rounded-2xl p-6 lg:p-7 border border-white/[0.08] space-y-4 w-full"
    aria-label="Report details"
  >
    <h3 className="text-lg font-semibold text-white">Report Details</h3>

    <dl className="space-y-3">
      <InfoRow
        icon={<MapPin size={16} className="text-blue-400" aria-hidden="true" />}
        label="Category"
        value={report.category?.name || 'Uncategorized'}
      />
      <InfoRow
        icon={<User size={16} className="text-blue-400" aria-hidden="true" />}
        label="Reported by"
        value={report.user?.name || 'Anonymous'}
      />
      <InfoRow
        icon={<Calendar size={16} className="text-blue-400" aria-hidden="true" />}
        label="Created"
        value={formatDate(report.createdAt)}
      />
      {report.resolvedAt && (
        <InfoRow
          icon={<Clock size={16} className="text-green-400" aria-hidden="true" />}
          label="Resolved"
          value={formatDate(report.resolvedAt)}
        />
      )}
    </dl>
  </section>
));

ReportInfoCard.displayName = 'ReportInfoCard';

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 text-white/60">
    <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="text-sm text-white">{value}</dd>
    </div>
  </div>
);

export default ReportInfoCard;