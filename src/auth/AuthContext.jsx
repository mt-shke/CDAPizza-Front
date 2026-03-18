import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [token, setToken] = useState(localStorage.getItem("token"));

   const login = (newToken) => {
      localStorage.setItem("token", newToken);
      setToken(newToken);
   };

   const logout = () => {
      localStorage.removeItem("token");
      setToken(null);
   };

   const isAuthenticated = () => !!token;

   const getRole = () => {
      if (!token) return null;
      try {
         return jwtDecode(token).role;
      } catch {
         return null;
      }
   };

   const getIdUser = () => {
      if (!token) return null;
      try {
         return jwtDecode(token).id_user;
      } catch {
         return null;
      }
   };

   const getUsername = () => {
      if (!token) return null;
      try {
         return jwtDecode(token).sub;
      } catch {
         return null;
      }
   };

   return (
      <AuthContext.Provider
         value={{
            token,
            login,
            logout,
            isAuthenticated,
            getRole,
            getIdUser,
            getUsername,
         }}
      >
         {children}
      </AuthContext.Provider>
   );
};

export const useAuth = () => useContext(AuthContext);
