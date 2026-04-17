import { createContext, useContext, useState, useEffect } from "react";
import { getAllReports, getOverviewStats } from "../services/adminService";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
const [reports, setReports] = useState([]);
const [stats,   setStats]   = useState(null);
const [loading, setLoading] = useState(true);

const fetchData = async () => {
    try {
    const [statsRes, reportsRes] = await Promise.all([
        getOverviewStats(),
        getAllReports(),
    ]);
    setStats(statsRes.data.data);
    setReports(reportsRes.data.data);
    } catch (err) {
    console.error(err);
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    fetchData();
}, []);

const updateReportStatus = (id, newStatus) => {
    setReports(prev =>
    prev.map(r => r.id === parseInt(id) ? { ...r, status: newStatus } : r)
    );
    // Update stats
    setStats(prev => {
    if (!prev) return prev;
    const report = reports.find(r => r.id === parseInt(id));
    if (!report) return prev;
    return {
        ...prev,
        pendingReports:     prev.pendingReports     + (newStatus === "PENDING"     ? 1 : report.status === "PENDING"     ? -1 : 0),
        inProgressReports:  prev.inProgressReports  + (newStatus === "IN_PROGRESS" ? 1 : report.status === "IN_PROGRESS" ? -1 : 0),
        resolvedReports:    prev.resolvedReports     + (newStatus === "RESOLVED"    ? 1 : report.status === "RESOLVED"    ? -1 : 0),
    };
    });
};

const removeReport = (id) => {
    setReports(prev => prev.filter(r => r.id !== parseInt(id)));
    setStats(prev => ({
    ...prev,
    totalReports: prev.totalReports - 1,
    }));
};

return (
    <AdminContext.Provider value={{
        reports,
        stats,
        loading,
        fetchData,
        updateReportStatus,
        removeReport,
    }}>
        {children}
    </AdminContext.Provider>
);
};

export const useAdminContext = () => useContext(AdminContext);