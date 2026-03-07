// useCreateReport - Hook for create report form submission (for CreateReport.jsx)
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import reportService from '../services/reportService';
import useGeolocation from './useGeolocation';
import useCreateReportForm from './useCreateReportForm';
import { validateReportForm } from '../utils/reportValidation';
import toast from 'react-hot-toast';

const useCreateReport = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Form state hook
  const {
    formData,
    image,
    imagePreview,
    errors,
    showMap,
    setShowMap,
    setErrors,
    handleInputChange,
    handleImageChange,
    removeImage,
    updateLocation,
  } = useCreateReportForm();

  // Loading states
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);

  // Geolocation
  const { getCurrentPosition: getLocation, loading: geoLoading } = useGeolocation();

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await reportService.getCategories();
      setCategories(data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      toast.error("Failed to load categories");
    } finally {
      setFetchingCategories(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Get current location
  const handleGetCurrentLocation = useCallback(async () => {
    try {
      const location = await getLocation();
      if (location) {
        updateLocation(location.lat, location.lng);
        toast.success("Location obtained!");
      }
    } catch (err) {
      console.error("Geolocation error:", err);
    }
  }, [getLocation, updateLocation]);

  // Location from map click
  const handleLocationSelect = useCallback((lat, lng) => {
    updateLocation(lat, lng);
    toast.success("Location selected from map!");
  }, [updateLocation]);

  // Validate form
  const validateForm = useCallback(() => {
    const { errors: validationErrors, isValid } = validateReportForm(formData, image);
    setErrors(validationErrors);
    return isValid;
  }, [formData, image, setErrors]);

  // Submit handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setLoading(true);
    
    try {
      const formDataPayload = new FormData();
      formDataPayload.append("title", formData.title.trim());
      formDataPayload.append("description", formData.description.trim());
      formDataPayload.append("categoryId", formData.categoryId);
      formDataPayload.append("latitude", formData.latitude);
      formDataPayload.append("longitude", formData.longitude);
      formDataPayload.append("image", image);
      
      const response = await reportService.createReport(formDataPayload);
      
      if (response.status === 201) {
        toast.success("Report created successfully!");
        navigate("/reports");
      }
    } catch (err) {
      console.error("Create report error:", err);
      const errorMessage = err.response?.data?.message || "Failed to create report";
      toast.error(errorMessage);
      
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach(error => {
          if (error.path) {
            fieldErrors[error.path] = error.msg;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  }, [formData, image, navigate, validateForm, setErrors]);

  // Go back handler
  const handleGoBack = useCallback(() => {
    navigate("/reports");
  }, [navigate]);

  // Wrapper for removeImage that handles the ref
  const handleRemoveImage = useCallback(() => {
    removeImage(fileInputRef);
  }, [removeImage]);

  return {
    // State
    formData,
    imagePreview,
    errors,
    showMap,
    categories,
    loading,
    fetchingCategories,
    geoLoading,
    fileInputRef,
    setShowMap,
    // Handlers
    handleInputChange,
    handleImageChange,
    removeImage: handleRemoveImage,
    handleGetCurrentLocation,
    handleLocationSelect,
    handleSubmit,
    handleGoBack,
  };
};

export default useCreateReport;

