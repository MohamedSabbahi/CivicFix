// MapPage.jsx - Enhanced Visual Design
import Sidebar from '../../home/components/Sidebar';
import { Search, Filter, RefreshCw, Crosshair } from 'lucide-react';
import background from '../../../assets/background-dashbord.png';
import useMapReports from '../hooks/useMapReports';
import MapContainerComponent from '../components/map/MapContainer';
import MapFilters from '../components/map/MapFilters';
import ReportsList from '../components/report/ReportsList';

const MapPage = () => {
  const {
    filteredReports,
    categories,
    loading,
    selectedReport,
    statusFilter,
    categoryFilter,
    searchRadius,
    searchQuery,
    mapCenter,
    mapZoom,
    userLocation,
    stats,
    showFilters,
    setStatusFilter,
    setCategoryFilter,
    setSearchRadius,
    setSearchQuery,
    setShowFilters,
    fetchData,
    handleMarkerClick,
    handleGetUserLocation,
    resetFilters,
  } = useMapReports();

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* --- BACKGROUND DESIGN START --- */}
      {/* 1. Solid Base Layer (Deepest) */}
      <div className="fixed inset-0 bg-[#020617] -z-30" />

      {/* 2. Visual Texture - Increased opacity to ensure it's visible */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-20 mix-blend-screen -z-20" 
        style={{ backgroundImage: `url(${background})` }} 
      />

      {/* 3. Modern Mesh Gradients - Larger and brighter to peek around the map */}
      <div className="fixed top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] -z-10" />
      <div className="fixed bottom-[-10%] left-[10%] w-[45%] h-[45%] rounded-full bg-indigo-500/15 blur-[100px] -z-10" />
      {/* --- BACKGROUND DESIGN END --- */}

      <div className="relative z-10 flex">
        <Sidebar />
        
        <main className="flex-1 ml-56 mr-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Civic Map</h1>
              <p className="text-white/40 text-sm mt-1">Real-time visualization of reports in your area</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search with glassmorphism */}
              <div className="relative group">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2.5 w-72 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white/[0.1] transition-all text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 bg-white/[0.03] p-1 rounded-xl border border-white/5 backdrop-blur-sm">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    showFilters ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Filter size={16} />
                  Filters
                </button>
                
                <button
                  onClick={fetchData}
                  title="Refresh Map"
                  className="p-2 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-all active:rotate-180 duration-500"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
              
              <button
                onClick={handleGetUserLocation}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-all font-medium active:scale-95"
              >
                <Crosshair size={16} />
                My Location
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <MapFilters
                statusFilter={statusFilter}
                categoryFilter={categoryFilter}
                searchRadius={searchRadius}
                categories={categories}
                stats={stats}
                onStatusChange={setStatusFilter}
                onCategoryChange={setCategoryFilter}
                onRadiusChange={setSearchRadius}
                onReset={resetFilters}
              />
            </div>
          )}

          {/* Main Content (Map + Sidebar) */}
          <div className="flex gap-6 h-[calc(100vh-190px)]">
            {/* Map Container - Added a subtle shadow and higher border opacity */}
            <div className="flex-1 h-full rounded-2xl overflow-hidden border border-white/20 bg-[#020617]/40 backdrop-blur-sm shadow-2xl">
              <MapContainerComponent
                center={mapCenter}
                zoom={mapZoom}
                reports={filteredReports}
                userLocation={userLocation?.coordinates}
                showRadius={!!userLocation}
                radius={searchRadius}
                onMarkerClick={handleMarkerClick}
                loading={loading}
              />
            </div>

            {/* Reports List Sidebar */}
            <div className="w-80 h-full">
              <ReportsList
                reports={filteredReports}
                selectedReport={selectedReport}
                onReportClick={handleMarkerClick}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MapPage;