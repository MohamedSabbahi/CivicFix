// CreateReport.jsx - Create report form page (layout + wiring only)
import Sidebar from "../../home/components/Sidebar";
import { ArrowLeft } from "lucide-react";
import background from "../../../assets/background-dashbord.png";

import useCreateReport from "../hooks/useCreateReport";
import ReportForm from "../components/report/ReportForm";
import ReportLocation from "../components/report/ReportLocation";
import ReportImageUpload from "../components/report/ReportImageUpload";

const CreateReport = () => {
  const {
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
    handleInputChange,
    handleImageChange,
    removeImage,
    handleGetCurrentLocation,
    handleLocationSelect,
    handleSubmit,
    handleGoBack,
  } = useCreateReport();

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
            <ReportForm 
              formData={formData}
              errors={errors}
              categories={categories}
              fetchingCategories={fetchingCategories}
              loading={loading}
              onSubmit={handleSubmit}
              onInputChange={handleInputChange}
            >
              {/* Location Component */}
              <ReportLocation
                formData={formData}
                errors={errors}
                showMap={showMap}
                onToggleMap={() => setShowMap(!showMap)}
                onGetCurrentLocation={handleGetCurrentLocation}
                onLocationSelect={handleLocationSelect}
                geoLoading={geoLoading}
              />
              
              {/* Image Upload Component */}
              <ReportImageUpload
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
                onRemoveImage={removeImage}
                error={errors.image}
                fileInputRef={fileInputRef}
              />
            </ReportForm>
          </div>
        </main>
        
        {/* Right Panel - Tips */}
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

