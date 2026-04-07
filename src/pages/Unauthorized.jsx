import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Unauthorized() {
   const navigate = useNavigate();
   const { token, getRole } = useAuth();

   const handleRetour = () => {
      if (!token) {
         navigate("/login");
         return;
      }
      try {
         const role = getRole();
         if (role === "client") {
            navigate("/mes-commandes");
         } else {
            navigate("/commandes");
         }
      } catch {
         navigate("/login");
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

            {/* Contenu */}
            <div className="px-8 py-8 text-center">
               <div className="text-5xl mb-4">🚫</div>
               <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Accès refusé
               </h2>
               <p className="text-sm text-gray-400 mb-8">
                  Vous n'êtes pas autorisé à accéder à cette page.
               </p>
               <button
                  onClick={handleRetour}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition text-sm tracking-wide"
               >
                  Retour à l'accueil
               </button>
            </div>

            {/* Footer */}
            <div className="px-8 pb-6 text-center">
               <p className="text-xs text-gray-400">
                  CDAPizza — Gestion des commandes
               </p>
            </div>
         </div>
      </div>
   );
}
