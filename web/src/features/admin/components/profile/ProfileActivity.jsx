import { Globe, Bell, Shield, ChevronRight } from "lucide-react";

const ActivityItem = ({ icon, title, sub, dotColor }) => (
  <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
        {icon}
      </div>
      <div>
        <p className="text-white text-sm">{title}</p>
        <p className="text-white/30 text-xs flex items-center gap-1.5 mt-0.5">
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${dotColor}`} />
          {sub}
        </p>
      </div>
    </div>
    <ChevronRight size={14} className="text-white/20" />
  </div>
);

const ProfileActivity = () => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
        Recent Activity
      </h3>
      <button className="text-blue-400 text-xs flex items-center gap-1 hover:text-blue-300 transition">
        View All <ChevronRight size={12} />
      </button>
    </div>
    <div className="divide-y divide-white/5">
      <ActivityItem icon={<Globe  size={13} />} title="Logged in via Web" sub="Admin Panel"    dotColor="bg-blue-400"   />
      <ActivityItem icon={<Bell   size={13} />} title="Status Updated"    sub="Report #RP-001" dotColor="bg-green-400"  />
      <ActivityItem icon={<Shield size={13} />} title="Admin Action"      sub="Deleted report" dotColor="bg-yellow-400" />
    </div>
  </div>
);

export default ProfileActivity;