import React from "react";

const AuthInput = React.forwardRef(
    ({
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
        ...props
    },
    ref
    ) => {
    return (
        <div className="space-y-1 relative">
        {/* Label */}
        <label
            htmlFor={id}
            className="text-slate-400 text-xs uppercase font-bold tracking-widest ml-1"
        >
            {label}
        </label>

        {/* Input */}
        <input
            ref={ref} 
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
            {...props} 
            className={`w-full bg-[#020617]/60 border ${
            error ? "border-red-500" : "border-slate-700"
            } text-white rounded-2xl px-5 py-3 pr-12 focus:ring-2 focus:ring-blue-500/50 outline-none`}
        />

        {/* Right Icon / Button */}
        {rightElement && (
            <div className="absolute right-4 top-[38px]">
            {rightElement}
            </div>
        )}

        {/* Error */}
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
    }
);

export default AuthInput;