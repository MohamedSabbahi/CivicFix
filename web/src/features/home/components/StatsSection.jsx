import { FileText, CheckCircle, Activity, Clock } from "lucide-react";
import { useEffect, useState } from "react";

const StatsSection = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
    fetch("/api/admin/stats")
        .then(res => res.json())
        .then(data => setStats(data));
    }, []);

    if (!stats) return null;

    const items = [
    { label: "Total Reports", value: stats.totalReports, icon: FileText },
    { label: "Resolved", value: stats.resolvedReports, icon: CheckCircle },
    { label: "In Progress", value: stats.inProgressReports, icon: Activity },
    { label: "Avg Resolution Time", value: stats.averageResolutionTime, icon: Clock },
    ];

    return (
    <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, i) => (
            <div
            key={i}
            className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg"
            >
            <item.icon className="text-blue-400 mb-4" />
            <h3 className="text-3xl font-bold text-white">{item.value}</h3>
            <p className="text-gray-400">{item.label}</p>
            </div>
        ))}
        </div>
    </section>
    );
};

export default StatsSection ;   