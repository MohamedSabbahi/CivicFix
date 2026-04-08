import { NavLink, useNavigate } from "react-router-dom";
import { FileText, ChartColumn, Building2, User, LogOut } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 p-5 flex flex-col bg-black/20 backdrop-blur-xl text-white z-50 border-r border-white/10">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10">
          🏙️
        </div>
        <span className="text-lg font-semibold tracking-wide">CivicFix</span>
      </div>

      {/* NAV */}
      <nav className="space-y-2 text-sm">
        <SidebarItem icon={<FileText    size={18} />} label="Reports"     to="/admin"             end />
        <SidebarItem icon={<ChartColumn size={18} />} label="Analytics"   to="/admin/analytics"       />
        <SidebarItem icon={<Building2   size={18} />} label="Departments" to="/admin/departments"     />
        <SidebarItem icon={<User        size={18} />} label="Profile"     to="/admin/admprofile"      />
      </nav>

      <div className="flex-1" />

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition mb-3"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>

      {/* SYSTEM STATUS */}
      <div className="flex items-center gap-2 text-xs text-white/50">
        <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
        All systems normal
      </div>

    </aside>
  );
};

const SidebarItem = ({ icon, label, to, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition
      ${isActive ? "bg-white/15 text-white shadow-inner" : "hover:bg-white/10 text-white/70"}`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default Sidebar;