// useCreateReportForm - Hook for create report form state management
import { useState, useCallback } from 'react';
import { validateImageFile } from '../utils/reportValidation';

const useCreateReportForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    latitude: "",
    longitude: "",
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [showMap, setShowMap] = useState(false);

  // Input change handler
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  // Image change handler
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    const validation = validateImageFile(file);
    
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, image: validation.error }));
      return;
    }
    
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: "" }));
    }
  }, [errors.image]);

  // Remove image
  const removeImage = useCallback((fileInputRef) => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef?.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Update location from GPS or map
  const updateLocation = useCallback((lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));
  }, []);

  // Clear error
  const clearError = useCallback((field) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [errors]);

  // Set errors from outside
  const setFormErrors = useCallback((newErrors) => {
    setErrors(newErrors);
  }, []);

  return {
    // State
    formData,
    image,
    imagePreview,
    errors,
    showMap,
    // Setters
    setFormData,
    setShowMap,
    setErrors: setFormErrors,
    // Handlers
    handleInputChange,
    handleImageChange,
    removeImage,
    updateLocation,
    clearError,
  };
};

export default useCreateReportForm;

