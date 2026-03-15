import { useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { ArrowLeft, MapPin, Edit2, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import Sidebar  from '../../home/components/Sidebar';
import background   from '../../../assets/background-dashbord.png';
import { statusConfig } from '../components/report/reportConstants';
import { createMarkerIcon } from '../components/map/mapConstants';
import useReportDetails  from '../hooks/useReportDetails';
import ImageWithFallback  from '../components/ImageWithFallback.jsx';
import TrackingStatus from '../components/TrackingStatus.jsx';
import CommentsSection  from '../components/CommentsSection.jsx';
import ReportInfoCard  from '../components/ReportInfoCard.jsx';
import MapErrorBoundary from '../components/MapErrorBoundary.jsx';
import { resolveImageUrl, openInGoogleMaps } from '../utils/reportUtils.js';
const MAP_STYLE = { height: '100%', width: '100%' };
const BG_STYLE = { backgroundImage: `url(${background})` };

const PageShell = ({ children }) => (
  <div className="relative min-h-screen text-white">
    <div className="fixed inset-0 bg-cover bg-center" style={BG_STYLE} />
    <div className="fixed inset-0 bg-[#020617]/80" />
    <div className="relative z-10 flex">
      <Sidebar />
      <main className="flex-1 min-w-0 ml-[260px] p-8">{children}</main>
    </div>
  </div>
);

const LoadingView = () => (
  <PageShell>
    <div
      className="flex items-center justify-center h-[calc(100vh-64px)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <Loader2 size={24} className="animate-spin text-blue-500" aria-hidden="true" />
        <span className="text-white/60">Loading report…</span>
      </div>
    </div>
  </PageShell>
);

const ErrorView = ({ message }) => {
  const navigate = useNavigate();
  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
        <h2 className="text-2xl font-bold text-white mb-2">Report Not Found</h2>
        <p className="text-white/40 mb-6">
          {message || "The report you're looking for doesn't exist."}
        </p>
        <button
          onClick={() => navigate('/reports')}
          className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-medium transition-all"
        >
          Back to Reports
        </button>
      </div>
    </PageShell>
  );
};



const QuickAction = memo(({ onClick, icon, label, variant = 'default' }) => {
  const base =
    'w-full px-4 py-3 rounded-xl border text-left transition-all flex items-center gap-3 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  const variants = {
    default: 'bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-white/80 hover:text-white',
    primary: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30 text-blue-400',
  };

  return (
    <button onClick={onClick} className={`${base} ${variants[variant]}`}>
      {icon}
      {label}
    </button>
  );
});

QuickAction.displayName = 'QuickAction';



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

  const imageUrl = useMemo(
    () => resolveImageUrl(report?.photoUrl),
    [report?.photoUrl],
  );

  const status = report
    ? (statusConfig[report.status] ?? statusConfig.NEW)
    : statusConfig.NEW;

  const handleOpenMaps = useCallback(() => {
    if (report?.latitude && report?.longitude) {
      openInGoogleMaps(report.latitude, report.longitude);
    }
}, [report]);

  const handleEditTitle = useCallback(
    (e) => setEditData((prev) => ({ ...prev, title: e.target.value })),
    [setEditData],
  );

  const handleEditDescription = useCallback(
    (e) => setEditData((prev) => ({ ...prev, description: e.target.value })),
    [setEditData],
  );

  const handleCancelEdit = useCallback(
    () => setIsEditing(false),
    [setIsEditing],
  );

  const handleStartEdit = useCallback(
    () => setIsEditing(true),
    [setIsEditing],
  );

  const handleNavReports = useCallback(() => navigate('/reports'),        [navigate]);
  const handleNavMap     = useCallback(() => navigate('/map'),            [navigate]);
  const handleNavCreate  = useCallback(() => navigate('/create-report'),  [navigate]);


  if (loading) return <LoadingView />;
  if (error || !report) return <ErrorView message={error} />;


  return (
    <PageShell>

      {/* Header */}
      <header className="flex items-center justify-between mb-8 w-full">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          aria-label="Go back to reports list"
        >
          <ArrowLeft size={20} aria-hidden="true" />
          <span>Back to Reports</span>
        </button>

        <div className="flex items-center gap-2" role="group" aria-label="Report actions">
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06]
                      hover:bg-white/[0.1] border border-white/10 text-white/80
                      hover:text-yellow-400 transition-all"
            aria-label="Edit this report"
          >
            <Edit2 size={16} aria-hidden="true" />
            <span className="text-sm font-medium">Edit</span>
          </button>
          <button
            onClick={handleDeleteReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06]
                      hover:bg-red-500/20 border border-white/10 text-white/80
                      hover:text-red-400 transition-all"
            aria-label="Delete this report"
          >
            <Trash2 size={16} aria-hidden="true" />
            <span className="text-sm font-medium">Delete</span>
          </button>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full">
        <div className="lg:col-span-3 space-y-6 w-full min-w-0">
          {/* Hero image */}
          <section
            className="relative w-full h-[400px] lg:h-[500px] rounded-2xl overflow-hidden
                      bg-slate-800/50 border border-white/[0.06] shadow-xl"
          >
            <ImageWithFallback
              src={imageUrl}
              alt={report.title || 'Report image'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />


          </section>

          {/* Title and Description */}
          <section className="bg-white/[0.02] rounded-2xl p-6 lg:p-8 border border-white/[0.08] w-full">
            {isEditing ? (
              <form
                onSubmit={(e) => { e.preventDefault(); handleUpdateReport(); }}
                className="space-y-4"
                aria-label="Edit report form"
              >
                <div>
                  <label htmlFor="edit-title" className="sr-only">Report title</label>
                  <input
                    id="edit-title"
                    type="text"
                    value={editData.title}
                    onChange={handleEditTitle}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10
                              text-white text-xl font-bold focus:outline-none
                              focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-description" className="sr-only">Report description</label>
                  <textarea
                    id="edit-description"
                    value={editData.description}
                    onChange={handleEditDescription}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10
                              text-white focus:outline-none focus:ring-2
                              focus:ring-blue-500/50 resize-none"
                    placeholder="Add a description…"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600
                              text-white font-medium transition-all disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1]
                              text-white/80 font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-white mb-4">{report.title}</h1>
                <p className="text-white/60 leading-relaxed whitespace-pre-wrap">
                  {report.description || 'No description provided.'}
                </p>
              </>
            )}
          </section>

          {/* Location map */}
          <section className="bg-white/[0.02] rounded-2xl p-6 lg:p-8 border border-white/[0.08] w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Location</h3>
              <button
                onClick={handleOpenMaps}
                className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                aria-label="Open location in Google Maps"
              >
                <ExternalLink size={14} aria-hidden="true" />
                Open in Maps
              </button>
            </div>
            <div className="h-52 lg:h-56 w-full rounded-xl overflow-hidden border border-white/10">
              <MapErrorBoundary>
                <MapContainer
                  center={[report.latitude, report.longitude]}
                  zoom={15}
                  scrollWheelZoom={false}
                  dragging={false}
                  style={MAP_STYLE}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[report.latitude, report.longitude]}
                    icon={createMarkerIcon(report.status)}
                  />
                </MapContainer>
              </MapErrorBoundary>
            </div>
          </section>

          {/* Comments */}
          <CommentsSection
            comments={comments}
            commentsLoading={commentsLoading}
            newComment={newComment}
            onCommentChange={setNewComment}
            onAddComment={handleAddComment}
            isSubmitting={isSubmittingComment}
          />

          {/* Tracking timeline */}
          <TrackingStatus status={report.status} />
        </div>

        {/* Right sidebar */}
        <aside
          className="lg:col-span-1 space-y-6 w-full lg:sticky lg:top-8 lg:self-start"
          aria-label="Report sidebar"
        >
          <ReportInfoCard report={report} />

          {/* Quick Actions */}
          <section className="bg-white/[0.02] rounded-2xl p-6 lg:p-7 border border-white/[0.08] w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <nav className="space-y-2 w-full" aria-label="Quick navigation">

              <QuickAction
                onClick={handleNavReports}
                icon={<ArrowLeft size={18} className="text-blue-400" aria-hidden="true" />}
                label="View All Reports"
              />
              <QuickAction
                onClick={handleNavMap}
                icon={<MapPin size={18} className="text-blue-400" aria-hidden="true" />}
                label="Explore Map"
              />
              <QuickAction
                onClick={handleNavCreate}
                icon={<Edit2 size={18} aria-hidden="true" />}
                label="Create New Report"
                variant="primary"
              />
            </nav>
          </section>
        </aside>
      </div>
    </PageShell>
  );
};

export default ReportDetails;