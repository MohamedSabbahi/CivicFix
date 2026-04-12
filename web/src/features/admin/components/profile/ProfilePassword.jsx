import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import api from "../../../../services/api";

const PasswordField = ({ label, name, value, onChange, show, onToggle }) => (
<div className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 shrink-0">
    <Lock size={15} />
    </div>
    <div className="flex-1 min-w-0">
        <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium">{label}</p>
        <div className="flex items-center gap-2 mt-1">
        <input
            type={show ? "text" : "password"}
            name={name}
            value={value}
            onChange={onChange}
            className="flex-1 bg-transparent border-b border-white/10 focus:border-blue-400/50 text-white text-sm focus:outline-none py-0.5 transition-colors"
        />
        <button onClick={onToggle} className="text-white/30 hover:text-white/60 transition-colors">
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
    </div>
    </div>
</div>
);

const ProfilePassword = () => {
const [fields, setFields] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
});

const [show, setShow] = useState({
    currentPassword: false,
    newPassword:     false,
    confirmPassword: false,
});

const [status, setStatus] = useState(null);
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

const handleChange = (e) =>
    setFields({ ...fields, [e.target.name]: e.target.value });

const toggleShow = (name) =>
    setShow({ ...show, [name]: !show[name] });

const handleSave = async () => {
    if (!fields.currentPassword || !fields.newPassword || !fields.confirmPassword) {
        setStatus("error");
        setMessage("Please fill in all fields.");
        return;
    }
    if (fields.newPassword !== fields.confirmPassword) {
        setStatus("error");
        setMessage("New passwords do not match.");
        return;
    }
    if (fields.newPassword.length < 8) {
        setStatus("error");
        setMessage("New password must be at least 8 characters.");
        return;
    }

    setLoading(true);
    setStatus(null);
    try {
        await api.put("/auth/changePassword", {
        currentPassword: fields.currentPassword,
        newPassword:     fields.newPassword,
        });
        setStatus("success");
        setMessage("Password changed successfully.");
        setFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Failed to change password.");
    } finally {
        setLoading(false);
    }
};

return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-5">
        Change Password
    </h3>

    <div className="divide-y divide-white/5">
        <PasswordField
            label="Current Password"
            name="currentPassword"
            value={fields.currentPassword}
            onChange={handleChange}
            show={show.currentPassword}
            onToggle={() => toggleShow("currentPassword")}
        />
        <PasswordField
            label="New Password"
            name="newPassword"
            value={fields.newPassword}
            onChange={handleChange}
            show={show.newPassword}
            onToggle={() => toggleShow("newPassword")}
        />
        <PasswordField
            label="Confirm New Password"
            name="confirmPassword"
            value={fields.confirmPassword}
            onChange={handleChange}
            show={show.confirmPassword}
            onToggle={() => toggleShow("confirmPassword")}
        />
        </div>

      {/* Message */}
        {status && (
        <p className={`text-xs mt-4 ${status === "success" ? "text-green-400" : "text-red-400"}`}>
            {message}
        </p>
        )}

      {/* Bouton */}
    <button
        onClick={handleSave}
        disabled={loading}
        className="mt-5 w-full py-2.5 rounded-xl text-sm font-medium bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white transition"
    >
        {loading ? "Saving..." : "Save Password"}
    </button>
    </div>
);
};

export default ProfilePassword;