// ReportForm - Form UI component (inputs, labels, submit button only)
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';

const ReportForm = ({ 
  formData, 
  errors, 
  categories, 
  fetchingCategories, 
  loading,
  onSubmit, 
  onInputChange,
  children 
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Title */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
        <label className="block text-sm font-medium text-white/70 mb-2">
          Report Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onInputChange}
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
          onChange={onInputChange}
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
            onChange={onInputChange}
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

      {/* Children - for location and image components */}
      {children}

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
  );
};

export default ReportForm;

