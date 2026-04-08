import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar       from "../components/Sidebar";
import Breadcrumb    from "../components/Breadcrumb";
import { AdminProvider } from "../context/AdminContext";
import { useAuth } from "../../../context/AuthContext"; // ← ajustez si besoin
import background    from "../../../assets/background-dashbord.png";

const pageTitles = {
  "/admin":             "Report Management",
  "/admin/analytics":   "Analytics",
  "/admin/departments": "Departments",
  "/admin/admprofile":  "Profile",
};

const AdminLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const title = pageTitles[pathname] ?? "Report Management";

  // Initiales depuis le nom (ex: "Julian Chen" => "JC")
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  return (
    <div className="relative min-h-screen">

      {/* BACKGROUND */}
      <div
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${background})`, zIndex: 0 }}
      />

      {/* DARK OVERLAY */}
      <div
        className="fixed top-0 left-0 w-full h-full bg-[#020918]/80"
        style={{ zIndex: 1 }}
      />

      {/* CONTENU */}
      <div className="relative" style={{ zIndex: 2 }}>
        <AdminProvider>
          <Sidebar />
          <main className="ml-56 flex-1 p-6 min-h-screen">
            <header className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-lg font-semibold text-white">{title}</h1>
                <Breadcrumb />
              </div>

              {/* PROFIL CLIQUABLE */}
              <div
                className="flex items-center gap-3 cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => navigate('/admin/admprofile')}
              >
                <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold text-white">
                  {initials}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-white">
                    {user?.name ?? 'Admin'}
                  </div>
                  <div className="text-white/40 text-xs">
                    {user?.role ?? 'Lead Supervisor'}
                  </div>
                </div>
              </div>

            </header>
            <Outlet />
          </main>
        </AdminProvider>
      </div>

    </div>
  );
};

export default AdminLayout;