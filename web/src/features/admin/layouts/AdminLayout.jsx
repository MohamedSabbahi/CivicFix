import { Outlet, useLocation } from "react-router-dom";
import Sidebar     from "../components/Sidebar";
import Breadcrumb  from "../components/Breadcrumb";
import { AdminProvider } from "../context/AdminContext";

const pageTitles = {
  "/admin":             "Report Management",
  "/admin/analytics":   "Analytics",
  "/admin/departments": "Departments",
  "/admin/settings":    "Settings",
};

const AdminLayout = () => {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] ?? "Report Management";

  return (
    <AdminProvider>
      <div className="flex min-h-screen bg-[#0d1526] text-white">
        <Sidebar />
        <main className="ml-56 flex-1 p-6">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-lg font-semibold text-white">{title}</h1>
              <Breadcrumb />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                JC
              </div>
              <div className="text-sm">
                <div className="font-medium text-white">Julian Chen</div>
                <div className="text-white/40 text-xs">Lead Supervisor</div>
              </div>
            </div>
          </header>
          <Outlet />
        </main>
      </div>
    </AdminProvider>
  );
};

export default AdminLayout;