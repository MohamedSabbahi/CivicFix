import { useNavigate } from "react-router-dom";

const ReportActions = ({ category, userName, createdAt , latitude, longitude }) => {
const navigate = useNavigate();

const openMap = () => {
    if (latitude && longitude) {
    window.open(
        `https://www.google.com/maps?q=${latitude},${longitude}`,
        "_blank"
    );
    }
};


return (
    <div className="space-y-4">

      {/* REPORT DETAILS */}
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Report Details</h3>
        <div className="space-y-3">
        <div>
            <p className="text-xs text-white/30">Category</p>
            <p className="text-sm text-white font-medium">{category ?? "—"}</p>
        </div>
        <div>
            <p className="text-xs text-white/30">Reported by</p>
            <p className="text-sm text-white font-medium">{userName ?? "—"}</p>
        </div>
        <div>
            <p className="text-xs text-white/30">Created</p>
            <p className="text-sm text-white font-medium">
        {new Date(createdAt).toLocaleString()}
            </p>
        </div>
        </div>
    </div>

      {/* QUICK ACTIONS */}
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
        <div className="space-y-2">
        <button
            onClick={() => navigate("/admin")}
            className="w-full text-sm px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition text-left"
        >
            ← View All Reports
        </button>
        <button
            onClick={() => window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, "_blank")}
            className="w-full text-sm px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition text-left"
>
        📍 Explore Map
</button>
        <button
            onClick={() => navigate("/admin/departments")}
            className="w-full text-sm px-4 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition text-left"
        >
            🏢 Departments       
        </button>
        </div>
    </div>

    </div>
);
};

export default ReportActions;