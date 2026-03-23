import { useState, useEffect } from "react";
import CardStats from "../components/CardStats";
import { getDepartmentStats } from "../services/adminService";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    getDepartmentStats()
      .then(res  => setDepartments(res.data))
      .catch(err => console.error(err))
      .finally(  () => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <p className="text-white/40 text-sm">Loading...</p>
    </div>
  );

  return (
    <div className="space-y-6">

      
      <div className="grid grid-cols-4 gap-4">
        {departments.map(d => (
          <CardStats
            key={d.department}
            icon="🏢"
            label={d.department}
            value={d.resolvedReportsCount}
            delta={d.averageResolutionTime}
            deltaUp={true}
          />
        ))}
      </div>

    </div>
  );
};

export default Departments;