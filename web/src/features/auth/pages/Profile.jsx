import React ,{ useState , useEffect} from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import reportService from "../../reports/services/reportService";



const Profile = () => {
    const [user, setUser] = useState(null);
    const [myReports, setMyReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- NEW STATES TO FIX ERRORS ---
    const [activeModal, setActiveModal] = useState(null); // Controls which modal is open
    const [editData, setEditData] = useState({ name: "", email: "" });
    const [passwords, setPasswords] = useState({ oldPass: "", newPass: "" });
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const userData = authService.getCurrentUser();
                setUser(userData);
                // Pre-fill edit form with current data
                setEditData({ name: userData?.name || "", email: userData?.email || "" });

                const reports = await reportService.getUserReports(userData.id);
                setMyReports(reports || []);
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfileData();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            // Now using editData state instead of undefined variables
            await authService.updateProfile(editData); 
            setActiveModal(null);
            setUser(authService.getCurrentUser()); // Refresh display
            alert("Profile updated!");
        } catch (err) {
            console.error('Failed to update profile', err);
            alert("Failed to update profile");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            // Now using passwords state instead of undefined variables
            await authService.changePassword(passwords.oldPass, passwords.newPass);
            setActiveModal(null);
            setPasswords({ oldPass: "", newPass: "" }); // Clear fields
            alert("Password updated successfully!");
        } catch (err) {
            console.error('Password change failed', err);
            alert("Password change failed");
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    if (isLoading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-6">
            <div className="max-w-2xl mx-auto space-y-8">
                
                {/* --- USER INFORMATION SECTION --- */}
                <div className="bg-[#1e293b] rounded-3xl p-8 border border-slate-800 shadow-xl">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-bold">
                            {user?.name?.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{user?.name}</h1>
                            <p className="text-slate-400">{user?.email}</p>
                            {/* Role Display */}
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20 uppercase">
                                {user?.role || 'Citizen'}
                            </span>
                        </div>
                    </div>
                    
                    {/* Member Since Date */}
                    <div className="text-sm text-slate-500 border-t border-slate-700/50 pt-4">
                        Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setActiveModal('edit')} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-semibold transition-all">
                            Edit Profile
                        </button>
                        <button onClick={() => setActiveModal('password')} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-semibold transition-all">
                            Security
                        </button>
                        <button onClick={handleLogout} className="flex-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-3 rounded-xl font-semibold transition-all">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Simple modal overlays for edit and password (uses existing handlers) */}
                {activeModal === 'edit' && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                        <form onSubmit={handleUpdateProfile} className="bg-[#0b1220] p-6 rounded-2xl w-full max-w-md">
                            <h3 className="text-lg font-bold mb-4">Edit Profile</h3>
                            <label className="block mb-2 text-sm text-slate-400">Name</label>
                            <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="w-full mb-3 p-2 rounded bg-[#0f172a] border border-slate-700" />
                            <label className="block mb-2 text-sm text-slate-400">Email</label>
                            <input value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} className="w-full mb-4 p-2 rounded bg-[#0f172a] border border-slate-700" />
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded bg-slate-700">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded bg-blue-600">Save</button>
                            </div>
                        </form>
                    </div>
                )}

                {activeModal === 'password' && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                        <form onSubmit={handleChangePassword} className="bg-[#0b1220] p-6 rounded-2xl w-full max-w-md">
                            <h3 className="text-lg font-bold mb-4">Change Password</h3>
                            <label className="block mb-2 text-sm text-slate-400">Current Password</label>
                            <input type="password" value={passwords.oldPass} onChange={e => setPasswords({ ...passwords, oldPass: e.target.value })} className="w-full mb-3 p-2 rounded bg-[#0f172a] border border-slate-700" />
                            <label className="block mb-2 text-sm text-slate-400">New Password</label>
                            <input type="password" value={passwords.newPass} onChange={e => setPasswords({ ...passwords, newPass: e.target.value })} className="w-full mb-4 p-2 rounded bg-[#0f172a] border border-slate-700" />
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded bg-slate-700">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded bg-blue-600">Change</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* --- MY REPORTS SECTION --- */}
                <section>
                    <h2 className="text-xl font-bold mb-4 px-2">My Reports</h2>
                    {myReports.length === 0 ? (
                        <div className="bg-[#1e293b]/50 border-2 border-dashed border-slate-800 rounded-3xl p-10 text-center text-slate-500">
                            You haven't created any reports yet.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {myReports.map(report => (
                                <div key={report.id} className="bg-[#1e293b] p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-sm">{report.title}</h3>
                                        <p className="text-xs text-slate-400">{report.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Profile ;