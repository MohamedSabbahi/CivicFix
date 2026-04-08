const ToggleRow = ({ emoji, label, checked, onChange }) => (
  <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
    <span className="flex items-center gap-2.5 text-sm text-white/80">
      <span>{emoji}</span>
      {label}
    </span>
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-all duration-300
        ${checked ? "bg-blue-500" : "bg-white/15"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300
        ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  </div>
);

const ProfileSecurity = ({ twoFA, emailNotifs, onToggleTwoFA, onToggleEmail }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-5">
      Security Settings
    </h3>
    <div className="divide-y divide-white/5">
      <ToggleRow emoji="🛡️" label="Two-Factor Auth"    checked={twoFA}       onChange={onToggleTwoFA}  />
      <ToggleRow emoji="🔔" label="Email Notifications" checked={emailNotifs} onChange={onToggleEmail}  />
    </div>
  </div>
);

export default ProfileSecurity;