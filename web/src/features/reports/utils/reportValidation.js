// Report validation utilities - for validating create report form
import toast from 'react-hot-toast';

/**
 * Validate report form data
 * @param {Object} formData - The form data to validate
 * @param {Object} image - The uploaded image file
 * @returns {Object} - Object with errors and isValid properties
 */
export const validateReportForm = (formData, image) => {
  const errors = {};
  
  // Title validation
  if (!formData.title?.trim()) {
    errors.title = "Title is required";
  } else if (formData.title.trim().length < 5) {
    errors.title = "Title must be at least 5 characters";
  }
  
  // Description validation
  if (!formData.description?.trim()) {
    errors.description = "Description is required";
  } else if (formData.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
  }
  
  // Category validation
  if (!formData.categoryId) {
    errors.categoryId = "Please select a category";
  }
  
  // Latitude validation
  if (!formData.latitude) {
    errors.latitude = "Latitude is required";
  } else {
    const lat = parseFloat(formData.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.latitude = "Invalid latitude (-90 to 90)";
    }
  }
  
  // Longitude validation
  if (!formData.longitude) {
    errors.longitude = "Longitude is required";
  } else {
    const lng = parseFloat(formData.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.longitude = "Invalid longitude (-180 to 180)";
    }
  }
  
  // Image validation
  if (!image) {
    errors.image = "Please upload an image";
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

/**
 * Validate image file before upload
 * @param {File} file - The image file to validate
 * @returns {Object} - Object with valid status and error message
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: "No file selected" };
  }
  
  if (!file.type.startsWith('image/')) {
    toast.error("Please select an image file");
    return { valid: false, error: "Please select an image file" };
  }
  
  if (file.size > 5 * 1024 * 1024) {
    toast.error("Image size must be less than 5MB");
    return { valid: false, error: "Image size must be less than 5MB" };
  }
  
  return { valid: true };
};

/**
 * Format coordinates for display
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} - Formatted coordinates string
 */
export const formatCoordinates = (lat, lng) => {
  return `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
};

export default {
  validateReportForm,
  validateImageFile,
  formatCoordinates,
};

