import background from '../../../assets/background-dashbord.png'
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import ReportCard from "../components/ReportCard";
import CityMap from "../components/CityMap";

const ActivityItem = ({ avatar, title, sub, time, icon, color }) => {
  const ring = {
    yellow: "ring-yellow-400/40",
    blue: "ring-blue-400/40",
    green: "ring-green-400/40",
  };

  return (
    <div className="flex items-start gap-3 group">
      {/* Avatar */}
      <div className={`relative flex-shrink-0 w-8 h-8 rounded-full ring-2 ${ring[color]} overflow-hidden`}>
        <img src={avatar} alt="" className="w-full h-full object-cover" />
        <span className="absolute -bottom-0.5 -right-0.5 text-[10px]">{icon}</span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90 truncate">{title}</p>
        <p className="text-xs text-white/40 truncate">{sub}</p>
      </div>

      {/* Time */}
      <span className="text-[10px] text-white/30 flex-shrink-0 mt-0.5">{time}</span>
    </div>
  );
};

const StatBar = ({ label, value, max, color }) => (
  <div>
    <div className="flex justify-between text-xs text-white/50 mb-1">
      <span>{label}</span>
      <span className="text-white/70 font-medium">{value}</span>
    </div>
    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div
        className={`h-full rounded-full ${color} opacity-80 transition-all duration-500`}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  </div>
);




const Dashboard = () => {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url(${background})` }}
      />

      {/* Dark cinematic tint */}
      <div className="absolute inset-0 bg-[#020617]/60" />

      {/* Soft vignette */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/50" />

      {/* Blue glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-blue-500/20 blur-[150px]" />

      <div className="relative z-10 flex">
        <Sidebar />

        {/* MAIN */}
        <main className="ml-[260px] mr-[320px] p-6 space-y-6 w-full">
          <Header />

          {/* STATS */}
          <div className="grid grid-cols-4 gap-6">
            <StatCard title="Total Reports" value="24" subtitle="Total Reports" />
            <StatCard title="In Progress" value="5" subtitle="In Progress" highlight />
            <StatCard title="Resolved" value="12" subtitle="Resolved Reports" success />
            <StatCard title="Impact Score" value="87" subtitle="Community Impact" glow />
          </div>

          {/* MAP */}
<div className="relative p-5 h-[420px] rounded-2xl bg-white/[0.04] border border-white/[0.08]">
  <h3 className="text-lg font-semibold mb-3">City Activity Overview</h3>
  <div className="h-[330px] rounded-xl overflow-hidden">
    <CityMap />
  </div>
</div>

{/* REPORTS */}
<div className="space-y-3">

  {/* Header with filters */}
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-xl font-bold tracking-tight">My Reports</h3>
    <div className="flex items-center gap-5 text-sm">
      <span className="text-white font-semibold flex items-center gap-1.5 cursor-pointer">
        <span className="text-blue-400 text-base">♦</span> All
      </span>
      <span className="text-white/40 cursor-pointer hover:text-white/70 transition">New</span>
      <span className="text-white/40 cursor-pointer hover:text-white/70 transition flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block"/>
        In Progress
      </span>
      <span className="text-white/40 cursor-pointer hover:text-white/70 transition">Resolved</span>
    </div>
  </div>

  {/* Cards */}
  <ReportCard
    title="Streetlight Outage"
    status="New"
    address="123 Elm Street, Downtown"
    date="Mar 26, 2026"
  />
  <ReportCard
    title="Pothole on Main Road"
    status="In Progress"
    address="466 Main Avenue, Suite 100"
    date="Mar 20, 2026"
  />
  <ReportCard
    title="Traffic Sign Damage"
    status="Resolved"
    address="555 Pine Street"
    date="Mar 20, 2026"
  />
</div>
        </main>

{/* RIGHT PANEL */}
<aside className="fixed right-6 top-6 bottom-6 w-72 flex flex-col gap-4">

  {/* Recent Activity */}
  <div className="flex-1 p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md overflow-hidden">
    
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-semibold text-white">Recent Activity</h3>
      <button className="text-xs text-blue-400 hover:text-blue-300 transition">
        View All →
      </button>
    </div>

    {/* Activity list */}
    <div className="space-y-3">
      <ActivityItem
        avatar="https://i.pravatar.cc/40?img=1"
        title="Pothole on Main Road"
        sub="Technician assigned to report"
        time="2h ago"
        icon="🚧"
        color="yellow"
      />
      <ActivityItem
        avatar="https://i.pravatar.cc/40?img=2"
        title="Streetlight Outage"
        sub="Status changed to In Progress"
        time="5h ago"
        icon="💡"
        color="blue"
      />
      <ActivityItem
        avatar="https://i.pravatar.cc/40?img=3"
        title="Traffic Sign Fixed"
        sub="Report marked as Resolved"
        time="Yesterday"
        icon="✅"
        color="green"
      />
      <ActivityItem
        avatar="https://i.pravatar.cc/40?img=4"
        title="New Report Submitted"
        sub="Road damage near Pine Street"
        time="2d ago"
        icon="📋"
        color="blue"
      />
    </div>
  </div>

  {/* Quick Stats */}
  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
    <h3 className="text-base font-semibold text-white mb-4">This Week</h3>
    <div className="space-y-3">
      <StatBar label="Reports Submitted" value={8} max={10} color="bg-blue-400" />
      <StatBar label="Resolved" value={5} max={10} color="bg-green-400" />
      <StatBar label="In Progress" value={3} max={10} color="bg-yellow-400" />
    </div>
  </div>

  {/* Community Score */}
  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-base font-semibold text-white">Impact Score</h3>
      <span className="text-2xl font-bold text-blue-300">87</span>
    </div>
    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
        style={{ width: "87%" }}
      />
    </div>
    <p className="text-xs text-white/40 mt-2">Top 12% in your city 🏆</p>
  </div>

</aside>
      </div>
    </div>
  );
};

export default Dashboard;