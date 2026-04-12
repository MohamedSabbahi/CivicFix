import { useState, useEffect } from "react";
import { useAuth }             from "../../../context/AuthContext";
import api                     from "../../../services/api";
import ProfileHero             from "../components/profile/ProfileHero";
import ProfileInfo             from "../components/profile/ProfileInfo";
import ProfilePassword         from "../components/profile/ProfilePassword";
const AVATAR_PLACEHOLDER = "https://i.pravatar.cc/150?img=11";

const ADMprofile = () => {
  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    name:   user?.name  || "",
    email:  user?.email || "",
    role:   user?.role  || "ADMIN",
    avatar: user?.avatar || AVATAR_PLACEHOLDER,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/auth/profile");
        setFormData({
          name:   data.name,
          email:  data.email,
          role:   data.role  || "ADMIN",
          avatar: data.avatar || AVATAR_PLACEHOLDER,
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  return (
    <div className="space-y-6">
      <ProfileHero formData={formData} />
      <div className="grid grid-cols-2 gap-5">
        <ProfileInfo     formData={formData} />
        <ProfilePassword />
      </div>
    </div>
  );
};

export default ADMprofile;