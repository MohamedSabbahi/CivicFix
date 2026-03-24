import { MapPin, MoreHorizontal, Navigation } from "lucide-react";

const pins = [
  { id: 1, top: "28%", left: "22%", color: "blue", label: "Streetlight Outage" },
  { id: 2, top: "45%", left: "42%", color: "blue", label: "Pothole Reported" },
  { id: 3, top: "35%", left: "62%", color: "yellow", label: "In Progress" },
  { id: 4, top: "20%", left: "55%", color: "white", label: "Traffic Sign" },
  { id: 5, top: "60%", left: "35%", color: "yellow", label: "Road Damage" },
  { id: 6, top: "15%", left: "75%", color: "blue", label: "New Report" },
];

const colorMap = {
  blue: {
    pin: "text-blue-400",
    glow: "shadow-[0_0_12px_rgba(59,130,246,0.9)]",
    bg: "bg-blue-400",
  },
  yellow: {
    pin: "text-yellow-400",
    glow: "shadow-[0_0_12px_rgba(234,179,8,0.9)]",
    bg: "bg-yellow-400",
  },
  white: {
    pin: "text-white",
    glow: "shadow-[0_0_12px_rgba(255,255,255,0.7)]",
    bg: "bg-white",
  },
};

// ✅ Accept onViewFullMap as a prop
const CityMap = ({ onViewFullMap }) => {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">

      {/* City aerial background */}
      <img
        src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80"
        alt="city"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#020617]/50" />

      {/* Blue tint overlay */}
      <div className="absolute inset-0 bg-blue-950/30" />

      {/* SVG connecting lines */}
      <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
        <line x1="22%" y1="28%" x2="42%" y2="45%" stroke="rgba(59,130,246,0.35)" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="42%" y1="45%" x2="62%" y2="35%" stroke="rgba(234,179,8,0.35)" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="62%" y1="35%" x2="75%" y2="15%" stroke="rgba(59,130,246,0.25)" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="42%" y1="45%" x2="35%" y2="60%" stroke="rgba(234,179,8,0.30)" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="55%" y1="20%" x2="62%" y2="35%" stroke="rgba(255,255,255,0.20)" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="22%" y1="28%" x2="55%" y2="20%" stroke="rgba(59,130,246,0.20)" strokeWidth="1" strokeDasharray="4,4" />
      </svg>

      {/* Pins */}
      {pins.map((pin) => {
        const c = colorMap[pin.color];
        return (
          <div
            key={pin.id}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ top: pin.top, left: pin.left }}
          >
            {/* Pulse ring */}
            <div className={`absolute inset-0 rounded-full ${c.bg} opacity-20 animate-ping scale-150`} />

            {/* Pin icon */}
            <MapPin
              size={22}
              className={`${c.pin} drop-shadow-lg`}
              style={{ filter: `drop-shadow(0 0 6px currentColor)` }}
              fill="currentColor"
            />

            {/* Tooltip */}
            <div className="
              absolute bottom-full left-1/2 -translate-x-1/2 mb-2
              px-2 py-1 rounded-lg text-xs text-white whitespace-nowrap
              bg-[rgba(2,6,23,0.85)] border border-white/10 backdrop-blur-md
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              pointer-events-none
            ">
              {pin.label}
            </div>
          </div>
        );
      })}

      {/* ✅ View Full Map button — now calls onViewFullMap prop */}
      <div className="absolute bottom-4 left-4 z-20">
        <button
          onClick={onViewFullMap}
          className="
            flex items-center gap-2 px-4 py-2 rounded-xl
            bg-white/[0.08] border border-white/15
            text-white/70 text-sm
            hover:bg-white/15 hover:text-white
            backdrop-blur-md transition-all duration-200
          "
        >
          <Navigation size={14} />
          View Full Map
        </button>
      </div>

      {/* Top right actions */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.08] border border-white/10 text-white/50 hover:text-white transition">
          <Navigation size={13} />
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.08] border border-white/10 text-white/50 hover:text-white transition">
          <MoreHorizontal size={13} />
        </button>
      </div>

    </div>
  );
};

export default CityMap;