import { useParams, useNavigate }  from "react-router-dom";
import { useState, useEffect }     from "react";
import ReportPhoto                 from "../components/reportDetail/ReportPhoto";
import ReportInfo                  from "../components/reportDetail/ReportInfo";
import ReportLocation              from "../components/reportDetail/ReportLocation";
import ReportActions               from "../components/reportDetail/ReportActions";
import ReportStatusUpdate          from "../components/reportDetail/ReportStatusUpdate";
import ReportEditModal             from "../components/reportDetail/ReportEditModal";
import ReportComments              from "../components/reportDetail/ReportComments";
import { getReportById, updateReportStatus, deleteReport } from "../services/adminService";
import { useAdminContext }          from "../context/AdminContext";

const ReportDetail = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { updateReportStatus: updateStatusInContext, removeReport } = useAdminContext();
  const [report,    setReport]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [showEdit,  setShowEdit]  = useState(false); // ← modal edit

  useEffect(() => {
    getReportById(id)
      .then(res  => setReport(res.data.data))
      .catch(err => console.error(err))
      .finally(  () => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this report?")) return;
    await deleteReport(id);
    removeReport(id);
    navigate("/admin");
  };

  const handleStatus = async (newStatus) => {
    try {
      await updateReportStatus(id, newStatus);
      setReport(prev => ({ ...prev, status: newStatus }));
      updateStatusInContext(id, newStatus);
    } catch (err) {
      console.error("Error:", err.response?.data);
    }
  };

  const handleSave = ({ title, description }) => {
    setReport(prev => ({ ...prev, title, description }));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <p className="text-white/40 text-sm">Loading...</p>
    </div>
  );

  if (!report) return (
    <div className="text-white/50 text-sm">Report not found.</div>
  );

  return (
    <div className="space-y-6">

      {/* EDIT MODAL */}
      {showEdit && (
        <ReportEditModal
          report={report}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
        />
      )}

      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/admin")}
          className="text-sm text-white/50 hover:text-white transition"
        >
          ← Back to Reports
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEdit(true)}   
            className="text-sm px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-sm px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <ReportPhoto    photoUrl={report.photoUrl}    status={report.status}           />
          <ReportInfo     title={report.title}           description={report.description} />
          <ReportLocation latitude={report.latitude}     longitude={report.longitude}     />
          <ReportComments reportId={id} />  
        </div>
        <div className="space-y-4">
          <ReportActions
            category={report.category?.name}
            userName={report.user?.name}
            createdAt={report.createdAt}
            latitude={report.latitude}
            longitude={report.longitude}
          />
          <ReportStatusUpdate
            status={report.status}
            onChange={handleStatus}
          />
        </div>
      </div>

    </div>
  );
};

export default ReportDetail;