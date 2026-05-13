import { useState, useEffect }   from "react";
import CardStats                 from "../components/CardStats";
import DepartmentCard    from "../components/department/DepartmentCard";
import AddDepartmentModal from "../components/department/AddDepartmentModal";
import { getDepartments, getDepartmentStats, deleteDepartment } from "../services/adminService";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [stats,       setStats]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depsRes, statsRes] = await Promise.all([
          getDepartments(),
          getDepartmentStats(),
        ]);
        setDepartments(depsRes.data.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    await deleteDepartment(id);
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  const handleAdd = (newDept) => {
    setDepartments(prev => [...prev, newDept]);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <p className="text-white/40 text-sm">Loading...</p>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* MODAL */}
      {showModal && (
        <AddDepartmentModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
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

      {/* HEADER + ADD BUTTON */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Departments</h2>
          <p className="text-xs text-white/40">{departments.length} departments total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          + Add Department
        </button>
      </div>

      {/* DEPARTMENT CARDS */}
      <div className="grid grid-cols-2 gap-4">
        {departments.map(d => (
          <DepartmentCard
            key={d.id}
            department={d}
            onDelete={handleDelete}
          />
        ))}
      </div>

    </div>
  );
};

export default Departments;
