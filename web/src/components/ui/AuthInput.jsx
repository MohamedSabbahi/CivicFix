import React from "react";

const AuthInput = ({
    label,
    error,
    icon, 
    rightElement,
    ...props
}) => {
        return (
    <div>
            <label className="text-slate-400 text-xs font-bold mb-2 block">
        {label}
            </label>

            <div className="relative">
        {icon && (
                <div className="absolute left-3 top-3 text-slate-400">
            {icon}
                </div>
        )}

        <input
                {...props}
                className={`w-full bg-[#1e293b] border ${
            error ? "border-red-500" : "border-slate-700"
            } text-white rounded-xl px-4 py-3 ${
            icon ? "pl-10" : ""
            } focus:ring-2 focus:ring-blue-500 outline-none`}
        />

        {rightElement && (
            <div className="absolute right-3 top-3">
            {rightElement}
            </div>
        )}
        </div>

        {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
        )}
    </div>
    );
};

export default AuthInput;