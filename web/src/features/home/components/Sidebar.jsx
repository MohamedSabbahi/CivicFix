import { Home, FileText, Map, Bell, User, Settings, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import authService from "../../auth/services/authService"; // adjust path as needed

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 p-5 flex flex-col">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10">
          🏠
        </div>
        <span className="text-lg font-semibold tracking-wide">
          CivicFix
        </span>
      </div>

      {/* NAV */}
      <nav className="space-y-2 text-sm text-white/80">
        <SidebarItem icon={<Home size={18} />}     label="Dashboard"     to="/" />
        <SidebarItem icon={<FileText size={18} />} label="My Reports"    to="/reports" />
        <SidebarItem icon={<Map size={18} />}      label="Map"           to="/map" />
        <SidebarItem icon={<Bell size={18} />}     label="Notifications" to="/notifications" />
        <SidebarItem icon={<User size={18} />}     label="Profile"       to="/profile" />
        <SidebarItem icon={<Settings size={18} />} label="Settings"      to="/settings" />
      </nav>

      {/* SPACER */}
      <div className="flex-1" />

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition text-white/70 hover:bg-white/10 hover:text-white w-full text-sm"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

const SidebarItem = ({ icon, label, to }) => (
  <NavLink
    to={to}
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