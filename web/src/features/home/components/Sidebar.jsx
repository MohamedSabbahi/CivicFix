import { Home, FileText, Map, Bell, User, Settings } from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="fixed left-6 top-6 bottom-6 w-56 glass p-5 space-y-6">
      <h1 className="text-xl font-bold">🏠 CivicFix</h1>

      <nav className="space-y-3 text-sm">
        <SidebarItem icon={<Home size={18} />} label="Dashboard" active />
        <SidebarItem icon={<FileText size={18} />} label="My Reports" />
        <SidebarItem icon={<Map size={18} />} label="Map" />
        <SidebarItem icon={<Bell size={18} />} label="Notifications" />
        <SidebarItem icon={<User size={18} />} label="Profile" />
        <SidebarItem icon={<Settings size={18} />} label="Settings" />
      </nav>
    </aside>
  );
};

const SidebarItem = ({ icon, label, active }) => (
  <div
    className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition
      ${active ? "bg-white/10" : "hover:bg-white/5"}`}
  >
    {icon}
    {label}
  </div>
);

export default Sidebar;