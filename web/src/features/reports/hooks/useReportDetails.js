// useReportDetails - Hook for fetching and managing single report details
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import reportService from '../services/reportService';
import toast from 'react-hot-toast';

const useReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: reportData } = await reportService.getReportById(id);
      const { data: deptsData } = await reportService.getReportDepartments(id);
      
      setReport({
        ...reportData.data,
        departments: deptsData.data || []
      });
      setEditData({
        title: reportData.data.title || '',
        description: reportData.data.description || ''
      });

      if (searchParams.get('edit') === 'true') {
        setIsEditing(true);
      }
    } catch (err) {
      console.error("Failed to fetch report:", err);
      setError(err.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [id, searchParams]);

  const fetchComments = useCallback(async () => {
    try {
      setCommentsLoading(true);
      const { data } = await reportService.getReportComments(id);
      setComments(data.data || []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchReport();
      fetchComments();
    }
  }, [id, fetchReport, fetchComments]);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      await reportService.addComment(id, { content: newComment.trim() });
      setNewComment('');
      fetchComments();
      toast.success("Comment added successfully!");
    } catch (err) {
      console.error("Failed to add comment:", err);
      toast.error(err.response?.data?.message || "Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  }, [id, newComment, fetchComments]);

  const handleUpdateReport = useCallback(async () => {
    if (!editData.title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      const { data } = await reportService.updateReport(id, {
        title: editData.title.trim(),
        description: editData.description.trim()
      });

      // Preserve departments — updateReport response doesn't include them
      setReport(prev => ({
        ...prev,
        ...data.data,
        departments: prev?.departments || []
      }));

      setIsEditing(false);
      toast.success("Report updated successfully!");
    } catch (err) {
      console.error("Failed to update report:", err);
      toast.error(err.response?.data?.message || "Failed to update report");
    } finally {
      setIsUpdating(false);
    }
  }, [id, editData]);

  const handleDeleteReport = useCallback(async () => {
    if (!window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      return;
    }

    try {
      await reportService.deleteReport(id);
      toast.success("Report deleted successfully!");
      navigate('/reports');
    } catch (err) {
      console.error("Failed to delete report:", err);
      toast.error(err.response?.data?.message || "Failed to delete report");
    }
  }, [id, navigate]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    report,
    loading,
    error,
    comments,
    commentsLoading,
    newComment,
    setNewComment,
    isSubmittingComment,
    isEditing,
    setIsEditing,
    editData,
    setEditData,
    isUpdating,
    fetchReport,
    fetchComments,
    handleAddComment,
    handleUpdateReport,
    handleDeleteReport,
    handleGoBack,
  };
};

export default useReportDetails;