const MapFilters = ({ 
  statusFilter, 
  categoryFilter, 
  searchRadius, 
  categories,
  stats,
  onStatusChange, 
  onCategoryChange,
  onRadiusChange,
  onReset 
}) => {
  return (
    <div className="mb-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white/80">Filter Reports</h3>
        <button
          onClick={onReset}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          Reset All
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-xs text-white/50 mb-1.5">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        
        {/* Category Filter */}
        <div>
          <label className="block text-xs text-white/50 mb-1.5">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        {/* Radius Filter */}
        <div>
          <label className="block text-xs text-white/50 mb-1.5">Search Radius (km)</label>
          <input
            type="range"
            min="1"
            max="50"
            value={searchRadius}
            onChange={(e) => onRadiusChange(e.target.value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-white/30 mt-1">
            <span>1 km</span>
            <span className="text-blue-400">{searchRadius} km</span>
            <span>50 km</span>
          </div>
        </div>
        
        {/* Stats Display */}
        <div className="flex items-center gap-2">
          <div className="flex-1 text-center p-2 rounded-lg bg-white/[0.05]">
            <div className="text-lg font-bold text-cyan-400">{stats.new}</div>
            <div className="text-[10px] text-white/40">New</div>
          </div>
          <div className="flex-1 text-center p-2 rounded-lg bg-white/[0.05]">
            <div className="text-lg font-bold text-orange-400">{stats.inProgress}</div>
            <div className="text-[10px] text-white/40">Progress</div>
          </div>
          <div className="flex-1 text-center p-2 rounded-lg bg-white/[0.05]">
            <div className="text-lg font-bold text-green-400">{stats.resolved}</div>
            <div className="text-[10px] text-white/40">Resolved</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapFilters;

