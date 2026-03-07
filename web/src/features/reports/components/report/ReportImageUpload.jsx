// ReportImageUpload - Image input and preview component
import { Camera, X } from 'lucide-react';

const ReportImageUpload = ({ imagePreview, onImageChange, onRemoveImage, error, fileInputRef }) => {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
      <label className="block text-sm font-medium text-white/70 mb-2">
        Photo Evidence <span className="text-red-400">*</span>
      </label>
      
      {!imagePreview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
            error 
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
            onClick={onRemoveImage}
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
        onChange={onImageChange}
        className="hidden"
      />
      
      {error && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default ReportImageUpload;

