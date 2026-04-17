import { User } from "lucide-react";

const AVATAR_PLACEHOLDER = "https://i.pravatar.cc/150?img=11";

const ProfileHero = ({ formData }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <div className="flex items-center gap-5">
      <div
        className="w-20 h-20 rounded-full border-2 border-blue-400/50 bg-cover bg-center bg-white/10"
        style={{ backgroundImage: `url(${formData.avatar || AVATAR_PLACEHOLDER})` }}
      />
      <div>
        <h2 className="text-xl font-bold text-white">{formData.name}</h2>
        <p className="text-white/40 text-sm mt-1">{formData.email}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/20 text-blue-300 font-medium">
            <User size={10} className="inline mr-1" />
            {formData.role}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-500/20 border border-green-400/20 text-green-300">
            ● Active
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default ProfileHero;