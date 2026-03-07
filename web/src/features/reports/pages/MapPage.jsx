// MapPage.jsx - Map page with filtering and markers (layout + wiring only)
import Sidebar from '../../home/components/Sidebar';
import { Search, Filter, RefreshCw, Crosshair } from 'lucide-react';

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
      {/* Background */}
      <div className="fixed inset-0 bg-[#020617]" />

      <div className="relative z-10 flex">
        <Sidebar />
        
        <main className="flex-1 ml-56 mr-6 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Civic Map</h1>
              <p className="text-white/40 text-sm">Explore reports in your area</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-64 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                  showFilters ? 'bg-blue-500 text-white' : 'bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.1]'
                }`}
              >
                <Filter size={16} />
                Filters
              </button>
              
              {/* Refresh */}
              <button
                onClick={fetchData}
                className="p-2 rounded-xl bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.1] transition"
              >
                <RefreshCw size={18} />
              </button>
              
              {/* Get Location */}
              <button
                onClick={handleGetUserLocation}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition"
              >
                <Crosshair size={16} />
                My Location
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
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
          )}

          {/* Main Content */}
          <div className="flex gap-4 h-[calc(100vh-180px)]">
            {/* Map */}
            <div className="flex-1 h-full">
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
            <ReportsList
              reports={filteredReports}
              selectedReport={selectedReport}
              onReportClick={handleMarkerClick}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MapPage;

