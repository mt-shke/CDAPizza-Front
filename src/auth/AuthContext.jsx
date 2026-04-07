import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);

   // Au démarrage, vérifie si le cookie est valide
   useEffect(() => {
      fetch(`${API_URL}/auth/me`, {
         credentials: "include", // envoie le cookie automatiquement
      })
         .then((res) => (res.ok ? res.json() : null))
         .then((data) => {
            setUser(data);
            setLoading(false);
         })
         .catch(() => setLoading(false));
   }, []);

   const login = (userData) => {
      setUser(userData); // userData = { username, role, id_user }
   };

   const logout = async () => {
      await fetch(`${API_URL}/auth/logout`, {
         method: "POST",
         credentials: "include",
      });
      setUser(null);
   };

   const isAuthenticated = () => !!user;
   const getRole = () => user?.role || null;
   const getIdUser = () => user?.id_user || null;
   const getUsername = () => user?.username || null;

   return (
      <AuthContext.Provider
         value={{
            user,
            loading,
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
