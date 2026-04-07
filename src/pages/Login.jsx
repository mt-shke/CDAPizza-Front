import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

export default function Login() {
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState("");
   const [loading, setLoading] = useState(false);
   const { login } = useAuth();
   const navigate = useNavigate();

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
         const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, password }),
         });
         if (!response.ok) {
            setError("Identifiants incorrects");
            setLoading(false);
            return;
         }
         const data = await response.json();
         login(data);

         if (data.role === "client") {
            navigate("/mes-commandes");
         } else {
            navigate("/commandes");
         }
      } catch (err) {
         setError("Impossible de contacter le serveur");
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
         <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-orange-500 px-8 py-10 text-center">
               <div className="text-5xl mb-3">🍕</div>
               <h1 className="text-3xl font-bold text-white tracking-tight">
                  CDAPizza
               </h1>
            </div>

            {/* Formulaire */}
            <div className="px-8 py-8">
               <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Connexion
               </h2>

               {error && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                     {error}
                  </div>
               )}

               <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Username */}
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom d'utilisateur
                     </label>
                     <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="ex: alice"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                     />
                  </div>

                  {/* Password */}
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe
                     </label>
                     <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                     />
                  </div>

                  {/* Submit */}
                  <button
                     type="submit"
                     disabled={loading}
                     className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-lg transition text-sm tracking-wide"
                  >
                     {loading ? "Connexion..." : "Se connecter"}
                  </button>
               </form>
            </div>

            {/* Footer */}
            <div className="px-8 pb-6 text-center">
               <p className="text-sm text-gray-400">
                  Pas encore de compte ?{" "}
                  <button
                     onClick={() => navigate("/register")}
                     className="text-orange-500 hover:text-orange-600 font-medium transition"
                  >
                     S'inscrire
                  </button>
               </p>
            </div>
         </div>
      </div>
   );
}
