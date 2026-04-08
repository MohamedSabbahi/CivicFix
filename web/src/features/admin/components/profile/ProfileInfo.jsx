import { User, Mail, Shield } from "lucide-react";

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium">{label}</p>
      <p className="text-white text-sm mt-0.5 truncate">{value || "—"}</p>
    </div>
  </div>
);

const ProfileInfo = ({ formData }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-5">
      Account Information
    </h3>
    <div className="divide-y divide-white/5">
      <InfoRow icon={<User   size={15} />} label="NAME"  value={formData.name}  />
      <InfoRow icon={<Mail   size={15} />} label="EMAIL" value={formData.email} />
      <InfoRow icon={<Shield size={15} />} label="ROLE"  value={formData.role}  />
    </div>
  </div>
);

export default ProfileInfo;