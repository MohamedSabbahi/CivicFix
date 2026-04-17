import { useState, useEffect, useCallback, useMemo } from 'react';
import reportService from '../services/reportService';
import useGeolocation from './useGeolocation';
import { DEFAULT_CENTER, DEFAULT_ZOOM, DEFAULT_RADIUS } from '../components/map/mapConstants';

const useMapReports = () => {
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchRadius, setSearchRadius] = useState(DEFAULT_RADIUS);
  const [searchQuery, setSearchQuery] = useState('');

  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

  const { location: userLocation, getCurrentPosition, loading: geoLoading } = useGeolocation();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reportsRes, categoriesRes] = await Promise.all([
        reportService.getReports({ limit: 100 }),
        reportService.getCategories()
      ]);
      setReports(reportsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const statusMap = {
        'new': 'PENDING',
        'in_progress': 'IN_PROGRESS',
        'resolved': 'RESOLVED'
      };
      const dbStatus = statusFilter !== 'all' ? statusMap[statusFilter] : 'all';
      const matchesStatus = dbStatus === 'all' || report.status === dbStatus;
      const matchesCategory = categoryFilter === 'all' || report.categoryId === parseInt(categoryFilter);
      const matchesSearch = !searchQuery || 
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [reports, statusFilter, categoryFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: reports.length,
    new: reports.filter(r => r.status === 'PENDING').length,
    inProgress: reports.filter(r => r.status === 'IN_PROGRESS').length,
    resolved: reports.filter(r => r.status === 'RESOLVED').length,
  }), [reports]);

  const handleMarkerClick = useCallback((report) => {
    setSelectedReport(report);
    setMapCenter([report.latitude, report.longitude]);
    setMapZoom(15);
  }, []);

  const handleGetUserLocation = useCallback(async () => {
    try {
      await getCurrentPosition();
      if (userLocation) {
        setMapCenter(userLocation.coordinates);
        setMapZoom(14);
      }
    } catch (err) {
      console.error('Failed to get location:', err);
    }
  }, [getCurrentPosition, userLocation]);

  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation.coordinates);
      setMapZoom(14);
    }
  }, [userLocation]);

  const resetFilters = useCallback(() => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
    setSearchRadius(DEFAULT_RADIUS);
  }, []);

  return {
    reports,
    filteredReports,
    categories,
    loading,
    selectedReport,
    statusFilter,
    categoryFilter,
    searchRadius,
    searchQuery,
    mapCenter,
    mapZoom,
    userLocation,
    geoLoading,
    stats,
    showFilters,
    setStatusFilter,
    setCategoryFilter,
    setSearchRadius,
    setSearchQuery,
    setShowFilters,
    setMapCenter,
    setMapZoom,
    fetchData,
    handleMarkerClick,
    handleGetUserLocation,
    resetFilters,
  };
};

export default useMapReports;

