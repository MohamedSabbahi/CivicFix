import { useAuth } from "../../../context/AuthContext";

const Header = () => {
  const { user } = useAuth();

  return (
<header className="flex items-center justify-center px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/10">
      <h2 className="text-lg font-semibold text-white/90">

        Welcome back,{" "}
        <span className="font-bold text-white tracking-wide">
          {user?.name || "User"} 👋
        </span>
      </h2>
    </header>
  );
};

export default Header;