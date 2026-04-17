const ReportStatusUpdate = ({ status, onChange }) => (
<div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
    <h3 className="text-sm font-semibold text-white">Update Status</h3>
    <select
        value={status}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/10 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none cursor-pointer"
    >
        <option value="PENDING"     className="bg-[#0f172a]">Pending</option>
        <option value="IN_PROGRESS" className="bg-[#0f172a]">In Progress</option>
        <option value="RESOLVED"    className="bg-[#0f172a]">Resolved</option>
    </select>
</div>
);

export default ReportStatusUpdate;