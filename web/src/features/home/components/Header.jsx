import { RefreshCw, User, Search, Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import IconBtn from "../../../components/ui/IconBtn";

const Header = () => {

  const { user } =useAuth();
  const navigate =useNavigate();

  const handleRefresh = () => { 
    window.location.reload() ;
  };

  const handleProfile = () =>{
    navigate("/profile");
  };
  const handleSearch = () => {
    console.log("Open search modal");
  };
  const handleNotifications = () =>{
    navigate("/notifications");
  };
  const handleSettings = () => {
    navigate("/settings");
  };

  const actions = [
    { label: "Refresh", icon: RefreshCw, onClick: handleRefresh, spin: true,},
    { label: "Profile", icon: User, onClick: handleProfile, },
    { label: "Search", icon: Search, onClick: handleSearch, },
    { label: "Notifications", icon: Bell, badge: true, pulse: true, onClick:  handleNotifications, },
    { label: "Settings", icon: Settings, onClick: handleSettings , }
  ]
  return (
    <header className="relative flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/10">
      {/* Title */}
      <h2 className="text-lg font-semibold text-white/90">
        Welcome back,{" "}
        <span className="font-bold text-white tracking-wide">
          {user?.name || "User"} 👋
        </span>
      </h2>

 {/* Right actions */}
      <div className="flex items-center gap-2">

        {/* Icon buttons */}
        {actions.map(({ icon: Icon, label, ...props }) => (
          <IconBtn
            key={label}
            icon={<Icon size={15} />}
            label={label}
            {...props}
          />
        ))}
      </div>
    </header>
  );
};



export default Header;