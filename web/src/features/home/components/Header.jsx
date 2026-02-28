import { RefreshCw, User, Search, Bell, Settings } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
const Header = () => {

  const { user } =useAuth();

  return (
    <div className="relative flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/10">
      {/* Title */}
      <h2 className="text-lg font-semibold text-white/90">
        Welcome back,{" "}
        <span className="font-bold text-white tracking-wide">
          {user?.name } 👋
        </span>
      </h2>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        <IconBtn icon={<RefreshCw size={15} />} />
        <IconBtn icon={<User size={15} />} />

      {/* Avatar + Name */}
      <div className="flex items-center gap-2.5 mx-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10">
          <img
            src="https://i.pravatar.cc/40"
            className="w-7 h-7 rounded-full border border-white/20"
            alt="avatar"
          />
          <span className="text-sm font-medium text-white/90">CivicFix</span>
        </div>

        {/* More icon buttons */}
        <IconBtn icon={<Search size={15} />} />
        <IconBtn icon={<Bell size={15} />} badge />
        <IconBtn icon={<Settings size={15} />} />
      </div>
    </div>
  );
};

const IconBtn = ({ icon, badge }) => (
  <button
    className="
      relative w-8 h-8 flex items-center justify-center
      rounded-full
      bg-white/[0.06]
      border border-white/10
      text-white/60
      hover:bg-white/10
      hover:text-white
      transition-all duration-200
    "
  >
    {icon}
    {badge && (
      <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-blue-400 border border-[#020617]" />
    )}
  </button>
);

export default Header;