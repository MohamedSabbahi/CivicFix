import React from "react";

const AuthInput = ({
    id,
    label,
    type = "text",
    value,
    onChange,
    error,
    placeholder,
    disabled,
    autoComplete,
    rightElement,
}) => {
        return (
    <div className="space-y-1 relative">
        <label
        htmlFor={id}
        className="text-slate-400 text-xs uppercase font-bold tracking-widest ml-1"
        >
        {label}
        </label>

        <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        placeholder={placeholder}
        className={`w-full bg-[#020617]/60 border ${
        error ? "border-red-500" : "border-slate-700"
        } text-white rounded-2xl px-5 py-3 pr-12 focus:ring-2 focus:ring-blue-500/50 outline-none`}
        />

        {rightElement && (
        <div className="absolute right-4 top-[38px]">
        {rightElement}
        </div>
        )}

        {error && (
        <p
        id={`${id}-error`}
        role="alert"
        className="text-red-500 text-[10px] mt-1 ml-1"
        >
        {error}
        </p>
    )}
    </div>
);
};

export default AuthInput;