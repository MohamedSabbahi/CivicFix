import { useLocation } from "react-router-dom";

const crumbMap = {
    "/admin":             ["Admin", "Dashboard"],
    "/admin/analytics":   ["Admin", "Dashboard", "Analytics"],
    "/admin/departments": ["Admin", "Dashboard", "Departments"],
    "/admin/settings":    ["Admin", "Dashboard", "Settings"],
    "/admin/reports":     ["Admin", "Dashboard", "Active Reports"],
};

const Breadcrumb = () => {
const { pathname } = useLocation();
const crumbs = crumbMap[pathname] || ["Admin"];
return (
    <nav className="flex items-center gap-1 text-xs text-white/40 mt-1">
    {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
        {i > 0 && <span>›</span>}
        <span className={i === crumbs.length - 1 ? "text-white/80" : ""}>
            {c}
        </span>
        </span>
    ))}
    </nav>
);
};

export default Breadcrumb;