const Header = () => {
  return (
    <div className="glass px-6 py-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">
        Welcome back, <span className="font-bold">Amadou 👋</span>
      </h2>

      <div className="flex items-center gap-4">
        <img
          src="https://i.pravatar.cc/40"
          className="w-9 h-9 rounded-full"
          alt="avatar"
        />
      </div>
    </div>
  );
};

export default Header;