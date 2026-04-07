import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

export default function Register() {
   const [username, setUsername] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirm, setConfirm] = useState("");
   const [error, setError] = useState("");
   const [success, setSuccess] = useState(false);
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");

      if (password !== confirm) {
         setError("Les mots de passe ne correspondent pas");
         return;
      }

      setLoading(true);
      try {
         const response = await fetch(API_URL + "/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
               username,
               email,
               password,
               role: "client",
            }),
         });

         if (response.status === 400) {
            const message = await response.text();
            setError(message);
            setLoading(false);
            return;
         }

         if (!response.ok) {
            setError("Une erreur est survenue, veuillez réessayer");
            setLoading(false);
            return;
         }

         setSuccess(true);
         setTimeout(() => navigate("/login"), 2000);
      } catch (err) {
         setError("Impossible de contacter le serveur");
      } finally {
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
               <p className="text-orange-100 text-sm mt-1">
                  Créez votre compte
               </p>
            </div>

            {/* Formulaire */}
            <div className="px-8 py-8">
               <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Inscription
               </h2>

               {/* Succès */}
               {success && (
                  <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                     ✅ Compte créé ! Redirection vers la connexion...
                  </div>
               )}

               {/* Erreur */}
               {error && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                     {error}
                  </div>
               )}

               {!success && (
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
                           placeholder="ex: michel"
                           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                        />
                     </div>

                     {/* Email */}
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                           Email
                        </label>
                        <input
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           required
                           placeholder="ex: michel@email.com"
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

                     {/* Confirm Password */}
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                           Confirmer le mot de passe
                        </label>
                        <input
                           type="password"
                           value={confirm}
                           onChange={(e) => setConfirm(e.target.value)}
                           required
                           placeholder="••••••••"
                           className={`w-full px-4 py-2.5 border rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition
                    ${
                       confirm && password !== confirm
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                    }`}
                        />
                        {confirm && password !== confirm && (
                           <p className="text-xs text-red-500 mt-1">
                              Les mots de passe ne correspondent pas
                           </p>
                        )}
                     </div>

                     {/* Submit */}
                     <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-lg transition text-sm tracking-wide"
                     >
                        {loading ? "Création du compte..." : "Créer mon compte"}
                     </button>
                  </form>
               )}
            </div>

            {/* Footer — lien vers login */}
            <div className="px-8 pb-6 text-center">
               <p className="text-sm text-gray-400">
                  Déjà un compte ?{" "}
                  <button
                     onClick={() => navigate("/login")}
                     className="text-orange-500 hover:text-orange-600 font-medium transition"
                  >
                     Se connecter
                  </button>
               </p>
            </div>
         </div>
      </div>
   );
}
