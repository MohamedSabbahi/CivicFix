import { useContext } from "react";
import AdminContext from "./adminContextCore.js";

export const useAdminContext = () => useContext(AdminContext);
