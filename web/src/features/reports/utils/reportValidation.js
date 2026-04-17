import toast from 'react-hot-toast';


export const validateReportForm = (formData, image) => {
  const errors = {};
  
  if (!formData.title?.trim()) {
    errors.title = "Title is required";
  } else if (formData.title.trim().length < 5) {
    errors.title = "Title must be at least 5 characters";
  }
  
  if (!formData.description?.trim()) {
    errors.description = "Description is required";
  } else if (formData.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
  }
  
  if (!formData.categoryId) {
    errors.categoryId = "Please select a category";
  }
  
  if (!formData.latitude) {
    errors.latitude = "Latitude is required";
  } else {
    const lat = parseFloat(formData.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.latitude = "Invalid latitude (-90 to 90)";
    }
  }
  
  if (!formData.longitude) {
    errors.longitude = "Longitude is required";
  } else {
    const lng = parseFloat(formData.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.longitude = "Invalid longitude (-180 to 180)";
    }
  }
  
  if (!image) {
    errors.image = "Please upload an image";
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

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

export const formatCoordinates = (lat, lng) => {
  return `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
};

export default {
  validateReportForm,
  validateImageFile,
  formatCoordinates,
};

