// useReports - Hook for fetching, filtering, deleting reports (for Report.jsx)
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import reportService from '../services/reportService';
import toast from 'react-hot-toast';

const useReports = () => {
  const navigate = useNavigate();
  
  // State
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch reports
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await reportService.getReports();
      setReports(data.data || []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Filter reports based on filter and search
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesFilter = filter === "all" || report.status === filter.toUpperCase();
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [reports, filter, searchQuery]);

  // Stats calculation
  const stats = useMemo(() => ({
    total: reports.length,
    new: reports.filter(r => r.status === "NEW").length,
    inProgress: reports.filter(r => r.status === "IN_PROGRESS").length,
    resolved: reports.filter(r => r.status === "RESOLVED").length,
  }), [reports]);

  // Handlers
  const handleViewReport = useCallback((report) => {
    navigate(`/reports/${report.id}`);
  }, [navigate]);

  const handleCreateNew = useCallback(() => {
    navigate("/create-report");
  }, [navigate]);

  const handleDeleteReport = useCallback(async (report) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await reportService.deleteReport(report.id);
        setReports(prev => prev.filter(r => r.id !== report.id));
        toast.success("Report deleted successfully!");
      } catch (err) {
        console.error("Failed to delete:", err);
        toast.error("Failed to delete report. Please try again.");
      }
    }
  }, []);

  const handleEditReport = useCallback((report) => {
    navigate(`/edit-report/${report.id}`);
  }, [navigate]);

  return {
    // State
    reports,
    filteredReports,
    loading,
    filter,
    searchQuery,
    stats,
    // Setters
    setFilter,
    setSearchQuery,
    // Actions
    fetchReports,
    handleViewReport,
    handleCreateNew,
    handleDeleteReport,
    handleEditReport,
  };
};

export default useReports;

