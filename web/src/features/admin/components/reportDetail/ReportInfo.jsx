const ReportInfo = ({ title, description }) => (
<div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
    <h2 className="text-xl font-bold text-white">{title}</h2>
    <p className="text-sm text-white/50">{description}</p>
</div>
);

export default ReportInfo;