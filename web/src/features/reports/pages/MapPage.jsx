import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {  MapContainer,  TileLayer,  Marker,  Popup,  useMap, Circle, ZoomControl} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Sidebar from '../../home/components/Sidebar';
import reportService from '../services/reportService';
import {  MapPin,  Navigation,  Search,  Filter,  X,  Loader2, RefreshCw, Layers, Crosshair, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// Fix Leaflet default marker icons for React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Status configuration with colors and icons
const statusConfig = {
    NEW: { color: '#3B82F6', label: 'New', bg: 'bg-blue-500', dot: 'bg-blue-400', icon: AlertCircle },
    IN_PROGRESS: { color: '#EAB308', label: 'In Progress', bg: 'bg-yellow-500', dot: 'bg-yellow-400', icon: Clock },
    RESOLVED: { color: '#22C55E', label: 'Resolved', bg: 'bg-green-500', dot: 'bg-green-400', icon: CheckCircle },
};

// Create custom marker icon based on report status
const createMarkerIcon = (status) => {
    const config = statusConfig[status] || statusConfig.NEW;
    return L.divIcon({
    className: 'custom-marker',
    html: `
        <div style="
        width: 36px;
        height: 36px;
        background: ${config.color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        ">
        <span style="
            transform: rotate(45deg);
            color: white;
            font-size: 16px;
            font-weight: bold;
        "></span>
        </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],   
    popupAnchor: [0, -36],
    });
};

// Component to control map centeringand zoom based on user location or selected report 
const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
    if (center) {
        map.setView(center, zoom || map.getZoom());
    }
    }, [center, zoom, map]);
    return null;
};

// Main MapPage Component 
const MapPage = () => {
        const navigate = useNavigate();
        const [reports, setReports] = useState([]);
        const [categories, setCategories] = useState([]);
        const [loading, setLoading] = useState(true);
        const [userLocation, setUserLocation] = useState(null);
        const [selectedReport, setSelectedReport] = useState(null);
        const [showFilters, setShowFilters] = useState(false);

  // Filter states
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchRadius, setSearchRadius] = useState(5);
    const    [searchQuery, setSearchQuery] = useState('');

  // Default center (NYC)
    const defaultCenter = [40.7128, -74.0060];
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [mapZoom, setMapZoom] = useState(13);

  // Fetch reports and categories
    const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const [reportsRes, categoriesRes] = await Promise.all([
        reportService.getReports({ limit: 100 }),
        reportService.getCategories()
        ]);

        setReports(reportsRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
    } catch (error) {
        console.error('Failed to fetch data:', error);
    } finally {
        setLoading(false);
    }
    }, []);

    useEffect(() => {
    fetchData();
    }, [fetchData]);

  // Get user's current location
    const getUserLocation = () => {
    if (navigator.geolocation) {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation([latitude, longitude]);
            setMapCenter([latitude, longitude]);
            setMapZoom(14);
            setLoading(false);
        },
        (error) => {
            console.error('Geolocation error:', error);
            alert('Unable to get your location. Please check your browser permissions.');
            setLoading(false);
        }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
    };

  // Filter reports
        const filteredReports = reports.filter(report => {
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter.toUpperCase();
    const matchesCategory = categoryFilter === 'all' || report.categoryId === parseInt(categoryFilter);
    const matchesSearch = !searchQuery || 
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
    });

  // Handle marker click
    const handleMarkerClick = (report) => {
    setSelectedReport(report);
    setMapCenter([report.latitude, report.longitude]);
    setMapZoom(15);
    };

  // Reset filters
    const resetFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
    setSearchRadius(5);
    };

  // Stats calculation
    const stats = {
    total: reports.length,
    new: reports.filter(r => r.status === 'NEW').length,
    inProgress: reports.filter(r => r.status === 'IN_PROGRESS').length,
    resolved: reports.filter(r => r.status === 'RESOLVED').length,
    };
    {/* we shoud change the background and import bg-background */}
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
                onClick={getUserLocation}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition"
                >
                <Crosshair size={16} />
                My Location
                </button>
            </div>
            </div>

          {/* Filters Panel */}
            {showFilters && (
            <div className="mb-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white/80">Filter Reports</h3>
                <button
                    onClick={resetFilters}
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
                    onChange={(e) => setStatusFilter(e.target.value)}
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
                    onChange={(e) => setCategoryFilter(e.target.value)}
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
                    onChange={(e) => setSearchRadius(e.target.value)}
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
                    <div className="text-lg font-bold text-blue-400">{stats.new}</div>
                    <div className="text-[10px] text-white/40">New</div>
                    </div>
                    <div className="flex-1 text-center p-2 rounded-lg bg-white/[0.05]">
                    <div className="text-lg font-bold text-yellow-400">{stats.inProgress}</div>
                    <div className="text-[10px] text-white/40">Progress</div>
                    </div>
                    <div className="flex-1 text-center p-2 rounded-lg bg-white/[0.05]">
                    <div className="text-lg font-bold text-green-400">{stats.resolved}</div>
                    <div className="text-[10px] text-white/40">Resolved</div>
                    </div>
                </div>
                </div>
            </div>
                )}

          {/* Main Content */}
            <div className="flex gap-4 h-[calc(100vh-180px)]">
            {/* Map */}
            <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/10">
                {loading && (
                <div className="absolute inset-0 z-[1000] bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
                )}

                <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                className="w-full h-full"
                zoomControl={false}
                >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <ZoomControl position="bottomright" />
                <MapController center={mapCenter} zoom={mapZoom} />
                
                {/* User location marker */}
                {userLocation && (
                    <Marker position={userLocation} icon={
                    L.divIcon({
                        className: 'user-marker',
                        html: `
                        <div style="
                            width: 20px;
                            height: 20px;
                            background: #8B5CF6;
                            border: 3px solid white;
                            border-radius: 50%;
                            box-shadow: 0 0 0 8px rgba(139, 92, 246, 0.3), 0 4px 12px rgba(0,0,0,0.3);
                        "></div>
                        `,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                    })
                    }>
                    <Popup>Your Location</Popup>
                    </Marker>   
                )}
                
                {/* Radius circle */}
                {userLocation && (
                    <Circle
                    center={userLocation}
                    radius={searchRadius * 1000}
                    pathOptions={{
                        color: '#3B82F6',
                        fillColor: '#3B82F6',
                        fillOpacity: 0.08,
                        weight: 2,
                        dashArray: '8, 8',
                    }}
                    />
                )}
                
                {/* Report markers */}
                {filteredReports.map((report) => (
                    <Marker
                    key={report.id}
                    position={[report.latitude, report.longitude]}
                    icon={createMarkerIcon(report.status)}
                    eventHandlers={{
                        click: () => handleMarkerClick(report),
                    }}
                    >
                    <Popup>
                        <div className="min-w-[220px] p-2">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{report.title}</h3>
                        <p className="text-gray-600 text-xs mb-2 line-clamp-2">{report.description}</p>
                        <div className="flex items-center justify-between mb-1">
                            <span 
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ 
                                backgroundColor: `${statusConfig[report.status]?.color}20`,
                                color: statusConfig[report.status]?.color
                            }}
                            >
                            {statusConfig[report.status]?.label || 'New'}
                            </span>
                            <span className="text-gray-400 text-xs">
                            {report.category?.name || 'Uncategorized'}
                            </span> 
                        </div>
                        <p className="text-gray-400 text-[10px]">
                            {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                        </div>
                    </Popup>
                    </Marker>
                ))}
                </MapContainer>
            </div>

            {/* Reports List Sidebar */}
            <div className="w-80 flex flex-col rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Reports ({filteredReports.length})</h3>
                </div>
                <p className="text-xs text-white/40">Click a marker on the map or browse below</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredReports.length === 0 ? (
                    <div className="text-center py-8 text-white/30">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No reports found</p>
                    </div>
                ) : (
                    filteredReports.map((report) => {
                    const status = statusConfig[report.status] || statusConfig.NEW;
                    const StatusIcon = status.icon;
                    
                    return (
                        <div
                        key={report.id}
                        onClick={() => handleMarkerClick(report)}
                        className={`p-3 rounded-xl cursor-pointer transition-all ${
                            selectedReport?.id === report.id
                            ? 'bg-blue-500/20 border border-blue-500/40'
                            : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]'
                        }`}
                        >
                        <div className="flex items-start gap-3">
                        <div 
                            className={`w-2 h-2 rounded-full mt-1.5 ${status.dot}`}
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">{report.title}</h4>
                            <p className="text-xs text-white/40 truncate mt-0.5">{report.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                            <span 
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                                style={{ 
                                    backgroundColor: `${status.color}20`,
                                    color: status.color
                                }}
                                >
                                {status.label}
                                </span>
                                <span className="text-[10px] text-white/30">
                                {report.category?.name}
                                </span>
                            </div>
                            </div>
                        </div>
                        </div>
                    );
                    })
                )}
                </div>
            </div>
            </div>
        </main>
        </div>
    </div>
    );
};

export default MapPage;

