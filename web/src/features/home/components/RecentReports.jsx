import { useEffect, useState } from "react";

const RecentReports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch("/api/reports?limit=6&sort=date&order=desc")
      .then(res => res.json())
      .then(data => setReports(data));
  }, []);

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-10 text-center">
          Recent Reports
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map(report => (
            <div
              key={report.id}
              className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden"
            >
              <img
                src={report.image}
                alt={report.title}
                className="h-40 w-full object-cover"
              />
              <div className="p-5">
                <h3 className="text-white font-semibold">
                  {report.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {report.address}
                </p>
                <span className="inline-block mt-3 text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                  {report.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-lg">
            View All Reports
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecentReports ;