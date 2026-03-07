// useMapReports - Hook for map page with reports, filtering (for MapPage.jsx)
import { useState, useEffect, useCallback, useMemo } from 'react';
import reportService from '../services/reportService';
import useGeolocation from './useGeolocation';
import { DEFAULT_CENTER, DEFAULT_ZOOM, DEFAULT_RADIUS } from '../components/map/mapConstants';

const useMapReports = () => {
  // Map state
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchRadius, setSearchRadius] = useState(DEFAULT_RADIUS);
  const [searchQuery, setSearchQuery] = useState('');

  // Map center/zoom
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

  // Geolocation
  const { location: userLocation, getCurrentPosition, loading: geoLoading } = useGeolocation();

  // Fetch data (reports + categories)
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

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter.toUpperCase();
      const matchesCategory = categoryFilter === 'all' || report.categoryId === parseInt(categoryFilter);
      const matchesSearch = !searchQuery || 
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [reports, statusFilter, categoryFilter, searchQuery]);

  // Stats calculation
  const stats = useMemo(() => ({
    total: reports.length,
    new: reports.filter(r => r.status === 'NEW').length,
    inProgress: reports.filter(r => r.status === 'IN_PROGRESS').length,
    resolved: reports.filter(r => r.status === 'RESOLVED').length,
  }), [reports]);

  // Handlers
  const handleMarkerClick = useCallback((report) => {
    setSelectedReport(report);
    setMapCenter([report.latitude, report.longitude]);
    setMapZoom(15);
  }, []);

  const handleGetUserLocation = useCallback(async () => {
    try {
      await getCurrentPosition();
      // After getting location, update map center
      if (userLocation) {
        setMapCenter(userLocation.coordinates);
        setMapZoom(14);
      }
    } catch (err) {
      console.error('Failed to get location:', err);
    }
  }, [getCurrentPosition, userLocation]);

  // Update map center when userLocation changes
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
    // Data
    reports,
    filteredReports,
    categories,
    loading,
    selectedReport,
    // Filter state
    statusFilter,
    categoryFilter,
    searchRadius,
    searchQuery,
    // Map state
    mapCenter,
    mapZoom,
    // Geolocation
    userLocation,
    geoLoading,
    // Stats
    stats,
    // UI state
    showFilters,
    // Setters
    setStatusFilter,
    setCategoryFilter,
    setSearchRadius,
    setSearchQuery,
    setShowFilters,
    setMapCenter,
    setMapZoom,
    // Actions
    fetchData,
    handleMarkerClick,
    handleGetUserLocation,
    resetFilters,
  };
};

export default useMapReports;

