import { useAuth } from "../auth/AuthContext";
import { Navigate } from "react-router-dom";

export const PrivateRoute = ({ children }) => {
   const { isAuthenticated } = useAuth();
   return isAuthenticated() ? children : <Navigate to="/login" />;
};

export const RoleRoute = ({ children, roles }) => {
   const { isAuthenticated, getRole } = useAuth();

   if (!isAuthenticated()) return <Navigate to="/login" />;

   const userRole = getRole();
   if (!roles.includes(userRole)) return <Navigate to="/unauthorized" />;

   return children;
};
