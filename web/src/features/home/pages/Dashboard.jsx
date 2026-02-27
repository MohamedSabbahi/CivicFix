import bgImage from "../../../assets/background-CivicFix.img.png";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import ReportCard from "../components/ReportCard";
import CityMap from "../components/CityMap";

const Dashboard = () => {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Blur + dark overlay */}
      <div className="absolute inset-0 backdrop-blur-[3px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/90 via-[#020617]/70 to-[#020617]/95" />

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
          <div className="glass p-5 h-[420px]">
            <h3 className="text-lg font-semibold mb-4">
              City Activity Overview
            </h3>
            <CityMap />
          </div>

          {/* REPORTS */}
          <div className="glass p-5 space-y-4">
            <h3 className="text-lg font-semibold">My Reports</h3>
            <ReportCard title="Streetlight Outage" status="New" />
            <ReportCard title="Pothole on Main Road" status="In Progress" />
            <ReportCard title="Traffic Sign Damage" status="Resolved" />
          </div>
        </main>

        {/* RIGHT PANEL */}
        <aside className="fixed right-6 top-6 bottom-6 w-72 glass p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

          <div className="space-y-4 text-sm">
            <div className="opacity-90">
              <p className="font-medium">Pothole on Main Road</p>
              <p className="text-white/40">2h ago</p>
            </div>
            <div className="opacity-90">
              <p className="font-medium">Streetlight Outage</p>
              <p className="text-white/40">5h ago</p>
            </div>
            <div className="opacity-90">
              <p className="font-medium">Traffic Sign Fixed</p>
              <p className="text-white/40">Yesterday</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;