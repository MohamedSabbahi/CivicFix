import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { 
  ArrowLeft, MapPin, Calendar, User, Clock, Send, 
  Edit2, Trash2, ExternalLink, MessageCircle, Loader2 
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import Sidebar from "../../home/components/Sidebar";
import background from "../../../assets/background-dashbord.png";
import { statusConfig } from '../components/report/reportConstants';
import useReportDetails from '../hooks/useReportDetails';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const getImageUrl = (photo) => {
  if (!photo) return null;
  
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }
  
  const apiUrl = (import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5001').replace(/\/+$/, '');
  const cleanPhoto = photo.replace(/^\/+/, '');
  
  const fullUrl = `${apiUrl}/${cleanPhoto}`;
  
  if (import.meta.env.DEV) {
    console.log('[ReportDetails] Image URL:', fullUrl);
  }
  
  return fullUrl;
};

const ImageWithFallback = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <MapPin size={48} className="text-slate-600" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => {
        console.error('[ReportDetails] Image failed to load:', src);
        setHasError(true);
      }}
    />
  );
};

const ReportDetails = () => {
  const navigate = useNavigate();
  const {
    report,
    loading,
    error,
    comments,
    commentsLoading,
    newComment,
    setNewComment,
    isSubmittingComment,
    isEditing,
    setIsEditing,
    editData,
    setEditData,
    isUpdating,
    handleAddComment,
    handleUpdateReport,
    handleDeleteReport,
    handleGoBack,
  } = useReportDetails();

  if (report) {
    console.log('[ReportDetails] Report data:', {
      id: report.id,
      title: report.title,
      photoUrl: report.photoUrl,
      status: report.status
    });                                      
  }

  const status = report ? (statusConfig[report.status] || statusConfig.PENDING) : statusConfig.PENDING;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openInMaps = () => {
    if (report?.latitude && report?.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`,
        '_blank'
      );
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen text-white">
        <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${background})` }} />
        <div className="fixed inset-0 bg-[#020617]/80" />
        <div className="relative z-10 flex">
          <Sidebar />
          <main className="flex-1 ml-[260px] p-8">
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
              <div className="flex items-center gap-3">
                <Loader2 size={24} className="animate-spin text-blue-500" />
                <span className="text-white/60">Loading report...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="relative min-h-screen text-white">
        <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${background})` }} />
        <div className="fixed inset-0 bg-[#020617]/80" />
        <div className="relative z-10 flex">
          <Sidebar />
          <main className="flex-1 ml-[260px] p-8">
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
              <h2 className="text-2xl font-bold text-white mb-2">Report Not Found</h2>
              <p className="text-white/40 mb-6">{error || "The report you're looking for doesn't exist."}</p>
              <button 
                onClick={() => navigate('/reports')}
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-medium transition-all"
              >
                Back to Reports
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${background})` }} />
      <div className="fixed inset-0 bg-[#020617]/80" />

      <div className="relative z-10 flex">
        <Sidebar />

        <main className="flex-1 ml-[260px] mr-[320px] p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={handleGoBack}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Reports</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white/80 hover:text-yellow-400 transition-all"
              >
                <Edit2 size={16} />
                <span className="text-sm font-medium">Edit</span>
              </button>
              <button 
                onClick={handleDeleteReport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-red-500/20 border border-white/10 text-white/80 hover:text-red-400 transition-all"
              >
                <Trash2 size={16} />
                <span className="text-sm font-medium">Delete</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="col-span-2 space-y-6">
              {/* Hero Image */}
              <div className="relative h-64 rounded-2xl overflow-hidden bg-slate-800">
                <ImageWithFallback
                  src={getImageUrl(report.photoUrl)}
                  alt={report.title || "Report Image"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/[0.1] backdrop-blur-sm border ${status.text} ${status.bg.replace('bg-', 'bg-white/[0.1] border-')}`}>
                    <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.08]">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                      placeholder="Add a description..."
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdateReport}
                        disabled={isUpdating}
                        className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all disabled:opacity-50"
                      >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/80 font-medium transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-white mb-4">{report.title}</h1>
                    <p className="text-white/60 leading-relaxed whitespace-pre-wrap">
                      {report.description || "No description provided."}
                    </p>
                  </>
                )}
              </div>

              {/* Location Map */}
              <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.08]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Location</h3>
                  <button 
                    onClick={openInMaps}
                    className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink size={14} />
                    Open in Maps
                  </button>
                </div>
                <div className="h-48 rounded-xl overflow-hidden border border-white/10">
                  <MapContainer
                    center={[report.latitude, report.longitude]}
                    zoom={15}
                    scrollWheelZoom={false}
                    dragging={false}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[report.latitude, report.longitude]} />
                  </MapContainer>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.08]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MessageCircle size={20} />
                    Comments
                  </h3>
                  <span className="text-sm text-white/40">{comments.length} comments</span>
                </div>

                {/* Comment Input */}
                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingComment ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>

                {/* Comments List */}
                {commentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-blue-500" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-white/40">
                    No comments yet. Be the first to comment!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <User size={18} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">{comment.user?.name || 'Anonymous'}</span>
                            <span className="text-xs text-white/40">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-white/70 whitespace-pre-wrap">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar -  */}
            <div className="space-y-6">
              {/* Report Info Card */}
              <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.08] space-y-4">
                <h3 className="text-lg font-semibold text-white">Report Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white/60">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                      <MapPin size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Category</p>
                      <p className="text-sm text-white">{report.category?.name || 'Uncategorized'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-white/60">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                      <User size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Reported by</p>
                      <p className="text-sm text-white">{report.user?.name || 'Anonymous'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-white/60">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                      <Calendar size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Created</p>
                      <p className="text-sm text-white">{formatDate(report.createdAt)}</p>
                    </div>
                  </div>

                  {report.resolvedAt && (
                    <div className="flex items-center gap-3 text-white/60">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                        <Clock size={16} className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Resolved</p>
                        <p className="text-sm text-white">{formatDate(report.resolvedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.08]">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => navigate('/reports')}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-left text-white/80 hover:text-white transition-all flex items-center gap-3"
                  >
                    <ArrowLeft size={18} className="text-blue-400" />
                    View All Reports
                  </button>
                  <button 
                    onClick={() => navigate('/map')}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-left text-white/80 hover:text-white transition-all flex items-center gap-3"
                  >
                    <MapPin size={18} className="text-blue-400" />
                    Explore Map
                  </button>
                  <button 
                    onClick={() => navigate('/create-report')}
                    className="w-full px-4 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-left text-blue-400 transition-all flex items-center gap-3"
                  >
                    <Edit2 size={18} />
                    Create New Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportDetails;

