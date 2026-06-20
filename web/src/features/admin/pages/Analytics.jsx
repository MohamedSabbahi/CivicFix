import { useState, useEffect }  from "react";
import { useAdminContext }       from "../context/useAdminContext.js";
import PeriodChart               from "../components/analytics/PeriodChart";
import AnalyticsSearch           from "../components/analytics/AnalyticsSearch";
import CardStats                 from "../components/CardStats";
import { getDepartmentStats }    from "../services/adminService";

const Analytics = () => {
  const { reports } = useAdminContext();
  const [deptStats, setDeptStats] = useState([]);

  useEffect(() => {
    getDepartmentStats()
      .then(res => setDeptStats(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6">

      {/* Department Performance */}
      {deptStats.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">
            Department Performance
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {deptStats.map(s => (
              <CardStats
                key={s.department}
                icon="🏢"
                label={s.department}
                value={s.resolvedCivicIssuesCount}
                delta={s.averageResolutionTime}
                deltaUp={true}
              />
            ))}
          </div>
        </div>
      )}

      <PeriodChart />
      <AnalyticsSearch reports={reports} />
    </div>
  );
};

export default Analytics;
