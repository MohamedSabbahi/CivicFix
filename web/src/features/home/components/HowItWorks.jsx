import { Camera, Mail, CheckCircle } from "lucide-react";

const HowItWorks = () => {
    const steps = [
    {   
        title: "Report a Problem",
        desc: "Submit an issue with photos and location.",
        icon: Camera,
    },
    {
        title: "We Notify Department",
        desc: "Relevant authorities are instantly informed.",
        icon: Mail,
    },
    {
        title: "Track Progress",
        desc: "Follow updates until the issue is resolved.",
        icon: CheckCircle,
    },
    ];

    return (
    <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-12">
            How CivicFix Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
            <div
                key={i}
                className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
            >
                <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-full bg-blue-500/20">
                <step.icon className="text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                {step.title}
                </h3>
                <p className="mt-2 text-gray-400">
                {step.desc}
                </p>
            </div>
            ))}
        </div>
        </div>
    </section>
    );
};

export default HowItWorks;