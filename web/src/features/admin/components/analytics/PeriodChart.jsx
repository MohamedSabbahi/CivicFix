import { useState, useEffect } from "react";
import { getReportsByPeriod }  from "../../services/adminService";

const periods = [
    { key: "day",   label: "Day"   },
    { key: "month", label: "Month" },
    { key: "year",  label: "Year"  },
];

const PeriodChart = () => {
const [period,   setPeriod]   = useState("month");
const [data,     setData]     = useState([]);
const [loading,  setLoading]  = useState(true);
const [animated, setAnimated] = useState(false);
const [hovered,  setHovered]  = useState(null);

useEffect(() => {
    setLoading(true);
    setAnimated(false);
    getReportsByPeriod(period)
        .then(res => {
        setData(res.data.data);
        setTimeout(() => setAnimated(true), 100);
    })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }, [period]);

const maxCount = Math.max(...data.map(d => d.count), 1);
const total    = data.reduce((sum, d) => sum + d.count, 0);

return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">

      {/* HEADER */}
    <div className="flex items-center justify-between">
        <div>
            <h3 className="text-sm font-semibold text-white">Reports Overview</h3>
            <p className="text-xs text-white/40 mt-0.5">
            {total} reports this {period}
            </p>
        </div>

        {/* PERIOD BUTTONS */}
        <div className="flex items-center gap-2">
            {periods.map(p => (
            <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`text-xs px-4 py-2 rounded-lg transition font-medium
                ${period === p.key
                    ? "bg-blue-500 text-white"
                    : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10"
                }`}
            >
                {p.label}
            </button>
            ))}
        </div>
    </div>

      {/* CHART */}
    {loading ? (
        <div className="flex items-center justify-center h-56">
            <p className="text-white/30 text-sm">Loading...</p>
        </div>
    ) : (
        <div className="space-y-2">

          {/* Y AXIS + BARS */}
            <div className="flex gap-3 h-56">

            {/* Y AXIS */}
            <div className="flex flex-col justify-between text-right pr-2 shrink-0">
              {[maxCount, Math.floor(maxCount * 0.75), Math.floor(maxCount * 0.5), Math.floor(maxCount * 0.25), 0].map((v, i) => (
                <span key={i} className="text-[10px] text-white/20">{v}</span>
                ))}
            </div>

            {/* BARS AREA */}
            <div className="flex-1 flex flex-col">

              {/* GRID LINES */}
                <div className="flex-1 relative">
                {[0, 25, 50, 75, 100].map((pct, i) => (
                    <div
                    key={i}
                    className="absolute w-full border-t border-white/5"
                    style={{ top: `${pct}%` }}
                />
                ))}

                {/* BARS */}
                <div className="absolute inset-0 flex items-end gap-1.5 pb-0">
                    {data.map((d, i) => {
                    const heightPct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                    const isHovered = hovered === i;

                    return (
                        <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end h-full relative group"
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        {/* TOOLTIP */}
                        {isHovered && (
                        <div className="absolute bottom-full mb-2 z-10 bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-center whitespace-nowrap shadow-xl">
                            <p className="text-white font-bold text-sm">{d.count}</p>
                            <p className="text-white/40 text-[10px]">{d.label}</p>
                        </div>
                        )}

                        {/* BAR */}
                        <div
                            className={`w-full rounded-t-md transition-all duration-700 ease-out ${
                            isHovered ? "bg-blue-400" : "bg-blue-500/70"
                            }`}
                            style={{
                            height: animated ? `${heightPct}%` : "0%",
                            minHeight: d.count > 0 ? "4px" : "0px",
                            transitionDelay: `${i * 40}ms`,
                        }}
                        />
                    </div>
                    );
                })}
                </div>
            </div>

            </div>
        </div>

          {/* X LABELS */}
        <div className="flex gap-1.5 pl-10">
            {data.map((d, i) => (
            <div key={i} className="flex-1 text-center">
                <p className={`text-[9px] truncate transition ${
                    hovered === i ? "text-blue-400" : "text-white/25"
                }`}>
                    {d.label}
                </p>
            </div>
            ))}
        </div>

        </div>
    )}

      {/* FOOTER STATS */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/10">
        <div className="text-center">
            <p className="text-lg font-bold text-white">{total}</p>
            <p className="text-xs text-white/30">Total</p>
        </div>
        <div className="text-center">
            <p className="text-lg font-bold text-blue-400">
            {data.length > 0 ? (total / data.length).toFixed(1) : 0}
            </p>
            <p className="text-xs text-white/30">Average</p>
        </div>
        <div className="text-center">
            <p className="text-lg font-bold text-green-400">{maxCount}</p>
            <p className="text-xs text-white/30">Peak</p>
        </div>
    </div>

    </div>
);
};

export default PeriodChart;