import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import authService from "../services/authService";
import AuthInput from "../../../components/ui/AuthInput";
import bgImage from "../../../assets/background-CivicFix.img.png";


// VALIDATION SCHEMA 

const schema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
    }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});


const Register = () => {    

    const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
    register,
    handleSubmit,
    formState: { errors },
    } = useForm({
    resolver: zodResolver(schema),
    });

    useEffect(() => {
    window.scrollTo(0, 0);
    if (authService.isAuthenticated()) navigate("/");
    }, [navigate]);


  // ================= SUBMIT =================

        const onSubmit = async (data) => {
    setIsLoading(true);

    try {
        await authService.register({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        });

        toast.success("Account created successfully 🎉");

        navigate("/");
    } catch (err) {
        toast.error(err.message || "Registration failed");
    } finally {
        setIsLoading(false);
    }
    };


        return (
    <div className="relative min-h-screen overflow-y-auto bg-[#0f172a] flex items-center justify-center p-6">

      {/* Background */}
        <div
        className="absolute inset-0"
        style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
        }}
        />

      {/* Card */}
        <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
            >

        {/* Header */}
        <div className="flex items-center mb-6">
            <Link
            to="/login"
            className="text-white bg-slate-800 p-2 rounded-lg"
            >
            ←
            </Link>

            <h2 className="text-white font-bold flex-1 text-center pr-8">
            Join CivicFix
            </h2>
        </div>


        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-6">
            Create Account
        </h1>


        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <AuthInput
            label="Full Name"
            placeholder="John Doe"
            error={errors.name?.message}
            {...register("name")}
            />

            <AuthInput
            label="Email"
            placeholder="email@example.com"
            error={errors.email?.message}
            {...register("email")}
            />

            <AuthInput
            label="Password"
            type={showPassword ? "text" : "password"}
            error={errors.password?.message}
            {...register("password")}
            rightElement={
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400"
                >
                👁️
                </button>
            }
            />

            <AuthInput
            label="Confirm Password"
            type="password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
            />


          {/* Submit */}
                <button
            disabled={isLoading}
            className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition"
                >
            {isLoading ? "Creating..." : "Create Account"}
                </button>


          {/* Divider */}
            <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-slate-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-slate-700"></div>
            </div>


          {/* Google Login */}
                <button
            type="button"
            className="w-full bg-white text-black py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition"
            onClick={() => toast("Google login coming soon 🚀")}
                >
            <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="google"
                    className="w-5 h-5"
            />
            Continue with Google
                </button>

        </form>


        {/* Footer */}
        <p className="text-slate-400 text-sm mt-6 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 font-bold">
            Login
            </Link>
        </p>

        </motion.div>
    </div>
    );
};

export default Register;