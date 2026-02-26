const HeroSection = () => {
    return (
    <section className="relative flex items-center justify-center min-h-screen px-6">
        <div className="max-w-4xl text-center backdrop-blur-xl bg-black/30 border border-white/10 rounded-3xl p-10 shadow-xl">
        
        <h1 className="text-4xl md:text-6xl font-bold text-white">
            Report Problems in Your <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Community
            </span>
        </h1>

        <p className="mt-6 text-lg text-gray-300">
            CivicFix empowers citizens to report, track, and resolve local issues
            like road damage, streetlight outages, and public safety concerns.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg hover:opacity-90 transition">
            Report a Problem
            </button>
            <button className="px-8 py-3 rounded-xl text-blue-400 bg-white/5 border border-white/10 hover:bg-white/10 transition">
            View Reports
            </button>
        </div>

        </div>
    </section>
    );
};

export default  HeroSection;