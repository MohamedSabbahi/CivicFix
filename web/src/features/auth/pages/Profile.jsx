import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import Sidebar from "../../home/components/Sidebar";
import { User, Mail, MapPin, Calendar, Edit, Save, ChevronRight, Bell, Globe, ArrowLeft, Camera,} from "lucide-react";
import background from "../../../assets/background-dashbord.png";

// Placeholder avatar URL for users without a custom avatar (img)
const AVATAR_PLACEHOLDER = "https://i.pravatar.cc/150?img=11";

const Profile = () => {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [twoFA, setTwoFA] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "Eric Anderson",
    email: user?.email || "eric.anderson@civicfix.io",
    location: user?.location || "San Francisco, CA",
    joinDate: user?.joinDate || "Jan 3, 2022",
    role: user?.role || "Admin",
    username: user?.username || "eric.anderson",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = () => {
    console.log("Saving profile...", formData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen flex relative">
      {/* background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${background})` }}
      />
      {/* Dark overlay over full screen */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#020918]/85 via-[#040f22]/75 to-[#060c1e]/85" />

      {/* Sidebar*/}
      <div className="relative z-20">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 ml-56 min-h-screen relative z-10">
        <div className="max-w-5xl mx-auto px-8 py-8 space-y-7">


          {/* ── Hero Card ── */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-7">
            {/* decorative glow blobs */}
            <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 right-10 w-48 h-48 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Avatar with glow ring */}
                <div className="relative group">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/50 to-cyan-400/30 blur-xl scale-125 opacity-70" />
                  <div
                    className="relative w-[90px] h-[90px] rounded-full border-[2.5px] border-blue-400/70 bg-cover bg-center shadow-[0_0_30px_rgba(96,165,250,0.45)]"
                    style={{ backgroundImage: `url(${user?.avatar || AVATAR_PLACEHOLDER})` }}
                  />
                  {isEditing && (
                    <button className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition">
                      <Camera size={18} />
                    </button>
                  )}
                </div>

                {/* Name + meta */}
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-transparent border-b-2 border-blue-400/60 text-white text-2xl font-bold tracking-tight focus:outline-none w-64"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-white tracking-tight">{formData.name}</h2>
                  )}
                  <p className="text-white/45 text-sm mt-1">{formData.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-300 text-xs font-medium">
                      <User size={11} /> {formData.role}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs">
                      ● Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit / Save button */}
              <button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg ${
                  isEditing
                    ? "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30"
                    : "bg-white/8 hover:bg-white/15 border border-white/15 text-white"
                }`}
              >
                {isEditing ? <Save size={15} /> : <Edit size={15} />}
                {isEditing ? "Save Changes" : "Edit Profile"}
              </button>
            </div>
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Account Information */}
            <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6">
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest mb-5">
                Account Information
              </h3>

              <div className="divide-y divide-white/[0.06]">
                <InfoRow icon={<User size={15} />}     label="USERNAME"      name="username"  value={formData.username}  isEditing={isEditing} onChange={handleChange} showArrow />
                <InfoRow icon={<Mail size={15} />}     label="EMAIL ADDRESS" name="email"     value={formData.email}     isEditing={isEditing} onChange={handleChange} />
                <InfoRow icon={<Calendar size={15} />} label="JOIN DATE"     name="joinDate"  value={formData.joinDate}  isEditing={false}     onChange={handleChange} />
                <InfoRow icon={<MapPin size={15} />}   label="LOCATION"      name="location"  value={formData.location}  isEditing={isEditing} onChange={handleChange} />
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 space-y-5">

              {/* Recent Activity */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest">Recent Activity</h3>
                  <button className="text-blue-400 text-xs flex items-center gap-0.5 hover:text-blue-300 transition">
                    View All <ChevronRight size={12} />
                  </button>
                </div>
                <div className="divide-y divide-white/[0.06]">
                  <ActivityItem icon={<Globe size={13} />}  title="Logged in via Web"  sub="San Francisco, CA · 192.168.1.10" dotColor="bg-blue-400" />
                  <ActivityItem icon={<Bell size={13} />}   title="Changed password"   sub="San Francisco, CA"                dotColor="bg-emerald-400" />
                </div>
              </div>

              {/* Security Settings */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6">
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest mb-5">Security Settings</h3>
                <div className="space-y-1 divide-y divide-white/[0.06]">
                  <ToggleRow emoji="🛡️" label="Two-Factor Authentication" checked={twoFA}       onChange={() => setTwoFA(!twoFA)} />
                  <ToggleRow emoji="🔔" label="Email Notifications"        checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};


/* ────────── Sub-components ────────── */

const InfoRow = ({ icon, label, value, name, isEditing, onChange, showArrow }) => (
  <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/40 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-white/35 uppercase tracking-[0.12em] font-medium">{label}</p>
        {isEditing ? (
          <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-transparent border-b border-blue-400/50 text-white text-sm focus:outline-none py-0.5 mt-1 focus:border-blue-400 transition-colors"
          />
        ) : (
          <p className="text-white text-sm mt-0.5 truncate font-light">{value}</p>
        )}
      </div>
    </div>
    {showArrow && !isEditing && (
      <ChevronRight size={15} className="text-white/20 ml-2 shrink-0" />
    )}
  </div>
);

const ActivityItem = ({ icon, title, sub, dotColor }) => (
  <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/50">
        {icon}
      </div>
      <div>
        <p className="text-white text-sm font-medium">{title}</p>
        <p className="text-white/35 text-xs flex items-center gap-1.5 mt-0.5">
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${dotColor}`} />
          {sub}
        </p>
      </div>
    </div>
    <ChevronRight size={14} className="text-white/20" />
  </div>
);

const ToggleRow = ({ emoji, label, checked, onChange }) => (
  <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
    <span className="flex items-center gap-2.5 text-sm text-white/80">
      <span className="text-base">{emoji}</span>
      {label}
    </span>
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
        checked
          ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-[0_0_12px_rgba(96,165,250,0.5)]"
          : "bg-white/15"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

export default Profile;