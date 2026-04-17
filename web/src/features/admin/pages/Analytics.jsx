import { useAdminContext }   from "../context/AdminContext";
import PeriodChart           from "../components/analytics/PeriodChart";
import AnalyticsSearch       from "../components/analytics/AnalyticsSearch";

const Analytics = () => {
  const { reports } = useAdminContext();

  return (
    <div className="space-y-6">
      <PeriodChart />
      <AnalyticsSearch reports={reports} />
    </div>
  );
};

export default Analytics