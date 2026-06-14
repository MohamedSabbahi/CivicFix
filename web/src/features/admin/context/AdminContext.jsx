import { useCallback, useState, useEffect } from "react";
import { getAllReports, getOverviewStats } from "../services/adminService";
import AdminContext from "./adminContextCore.js";

export const AdminProvider = ({ children }) => {
const [reports, setReports] = useState([]);
const [stats,   setStats]   = useState(null);
const [loading, setLoading] = useState(true);

const fetchData = useCallback(async () => {
    try {
    setLoading(true);
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
}, []);

useEffect(() => {
    fetchData();
}, [fetchData]);

const upsertReport = useCallback((report) => {
    setReports(prev => {
    const reportId = parseInt(report.id);
    const exists = prev.some(r => r.id === reportId);
    if (!exists) return [report, ...prev];
    return prev.map(r => r.id === reportId ? { ...r, ...report } : r);
    });
}, []);

const removeReport = useCallback((id) => {
    const reportId = parseInt(id);
    setReports(prev => prev.filter(r => r.id !== reportId));
}, []);

return (
    <AdminContext.Provider value={{
        reports,
        stats,
        loading,
        fetchData,
        upsertReport,
        removeReport,
    }}>
        {children}
    </AdminContext.Provider>
);
};
