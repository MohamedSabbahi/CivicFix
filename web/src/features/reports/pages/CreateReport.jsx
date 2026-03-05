import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import reportService from "../services/reportService";
import Sidebar from "../../home/components/Sidebar";
import { 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Map,
  Navigation
} from "lucide-react";
import toast from "react-hot-toast";
import background from "../../../assets/background-dashbord.png";

// Leaflet map components
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to center map on location
function MapCenterHandler({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center.lat && center.lng) {
      map.setView([center.lat, center.lng], 15);
    }
  }, [center, map]);
  return null;
}

const CreateReport = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await reportService.getCategories();
      setCategories(data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      toast.error("Failed to load categories");
    } finally {
      setFetchingCategories(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: "" }));
      }
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
          toast.success("Location obtained!");
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Unable to get your location");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = "Please select a category";
    }
    
    if (!formData.latitude) {
      newErrors.latitude = "Latitude is required";
    } else if (isNaN(parseFloat(formData.latitude)) || parseFloat(formData.latitude) < -90 || parseFloat(formData.latitude) > 90) {
      newErrors.latitude = "Invalid latitude (-90 to 90)";
    }
    
    if (!formData.longitude) {
      newErrors.longitude = "Longitude is required";
    } else if (isNaN(parseFloat(formData.longitude)) || parseFloat(formData.longitude) < -180 || parseFloat(formData.longitude) > 180) {
      newErrors.longitude = "Invalid longitude (-180 to 180)";
    }
    
    if (!image) {
      newErrors.image = "Please upload an image";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setLoading(true);
    
    try {
      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("description", formData.description.trim());
      data.append("categoryId", formData.categoryId);
      data.append("latitude", formData.latitude);
      data.append("longitude", formData.longitude);
      data.append("image", image);
      
      const response = await reportService.createReport(data);
      
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
  };

  const handleGoBack = () => {
    navigate("/reports");
  };

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${background})` }} />
      <div className="fixed inset-0 bg-[#020617]/80" />
      
      <div className="relative z-10 flex">
        <Sidebar />
        
        <main className="flex-1 ml-[260px] mr-[320px] p-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={handleGoBack}
                className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-white transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold">Create New Report</h1>
                <p className="text-white/40 mt-1">Submit a civic issue to your community</p>
              </div>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Report Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Streetlight outage on Main Street"
                  className={`w-full px-4 py-3 rounded-xl bg-white/[0.05] border ${
                    errors.title ? "border-red-400/50" : "border-white/10"
                  } text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.title}
                  </p>
                )}
              </div>
              
              {/* Description */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide detailed information about the issue..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl bg-white/[0.05] border ${
                    errors.description ? "border-red-400/50" : "border-white/10"
                  } text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.description}
                  </p>
                )}
              </div>
              
              {/* Category */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                {fetchingCategories ? (
                  <div className="flex items-center gap-2 text-white/40">
                    <Loader2 size={18} className="animate-spin" />
                    Loading categories...
                  </div>
                ) : (
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl bg-white/[0.05] border ${
                      errors.categoryId ? "border-red-400/50" : "border-white/10"
                    } text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none cursor-pointer`}
                  >
                    <option value="" className="bg-slate-800">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-slate-800">
                        {cat.name} - {cat.department?.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.categoryId}
                  </p>
                )}
              </div>
              
              {/* Location */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-white/70">
                    Location <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-medium transition"
                    >
                      <Navigation size={14} />
                      Current
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Latitude</label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      placeholder="e.g., 40.7128"
                      className={`w-full px-4 py-3 rounded-xl bg-white/[0.05] border ${
                        errors.latitude ? "border-red-400/50" : "border-white/10"
                      } text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50`}
                    />
                    {errors.latitude && (
                      <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.latitude}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Longitude</label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      placeholder="e.g., -74.0060"
                      className={`w-full px-4 py-3 rounded-xl bg-white/[0.05] border ${
                        errors.longitude ? "border-red-400/50" : "border-white/10"
                      } text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50`}
                    />
                    {errors.longitude && (
                      <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.longitude}
                      </p>
                    )}
                  </div>
                </div>

                {/* Interactive Map */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-sm font-medium transition mb-3"
                  >
                    <Map size={16} />
                    {showMap ? "Hide Map" : "Select from Map"}
                  </button>
                  
                  {showMap && (
                    <div className="rounded-xl overflow-hidden border border-white/10 h-64">
                      <MapContainer
                        center={formData.latitude && formData.longitude 
                          ? [parseFloat(formData.latitude), parseFloat(formData.longitude)] 
                          : [40.7128, -74.0060]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {formData.latitude && formData.longitude && (
                          <Marker position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]} />
                        )}
                        <MapClickHandler onLocationSelect={(lat, lng) => {
                          setFormData(prev => ({
                            ...prev,
                            latitude: lat.toFixed(6),
                            longitude: lng.toFixed(6)
                          }));
                          toast.success("Location selected from map!");
                        }} />
                        {formData.latitude && formData.longitude && (
                          <MapCenterHandler center={{ lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }} />
                        )}
                      </MapContainer>
                    </div>
                  )}
                  {showMap && (
                    <p className="text-xs text-white/40 mt-2">
                      Click on the map to select a location, or use the "Current" button to get your GPS coordinates.
                    </p>
                  )}
                </div>
              </div>
              
              {/* Image Upload */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Photo Evidence <span className="text-red-400">*</span>
                </label>
                
                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                      errors.image 
                        ? "border-red-400/50 hover:border-red-400/70" 
                        : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-white/[0.06] flex items-center justify-center">
                        <Camera size={24} className="text-white/50" />
                      </div>
                      <div>
                        <p className="text-white/70 font-medium">Click to upload an image</p>
                        <p className="text-white/30 text-sm mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 p-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                {errors.image && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.image}
                  </p>
                )}
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold text-lg transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating Report...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Submit Report
                  </>
                )}
              </button>
            </form>
          </div>
        </main>
        
        {/* Right Panel */}
        <aside className="fixed right-6 top-8 bottom-8 w-72">
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl h-full">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Tips</h3>
            <div className="space-y-4 text-sm text-white/60">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">1</span>
                </div>
                <p>Provide a clear and descriptive title for your report.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">2</span>
                </div>
                <p>Include detailed description of the issue location and condition.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">3</span>
                </div>
                <p>Upload a clear photo showing the problem.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">4</span>
                </div>
                <p>Use "Use Current Location" for accurate coordinates.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CreateReport;

