import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../config";

export default function NouvelleCommande() {
   const [pizzas, setPizzas] = useState([]);
   const [quantites, setQuantites] = useState({});
   const [nbCommandesClient, setNbCommandesClient] = useState(0);
   const [loading, setLoading] = useState(true);
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState("");
   const { token, logout } = useAuth();
   const navigate = useNavigate();

   useEffect(() => {
      fetchData();
   }, []);

   const fetchData = async () => {
      try {
         const decoded = jwtDecode(token);
         const idUser = decoded.id_user;

         // Pizzas
         const resPizzas = await fetch(API_URL + "/pizzas", {
            headers: { Authorization: `Bearer ${token}` },
         });
         if (resPizzas.status === 401) {
            logout();
            navigate("/login");
            return;
         }
         if (!resPizzas.ok) throw new Error();
         const data = await resPizzas.json();
         setPizzas(data);
         const init = {};
         data.forEach((p) => {
            init[p.id_pizza] = 0;
         });
         setQuantites(init);

         // Nombre de commandes existantes du client (pour calculer la remise fidélité)
         const resCommandes = await fetch(API_URL + "/commandes", {
            headers: { Authorization: `Bearer ${token}` },
         });
         if (resCommandes.ok) {
            const allCommandes = await resCommandes.json();
            const mesCommandes = allCommandes.filter(
               (c) => c.id_user === idUser,
            );
            setNbCommandesClient(mesCommandes.length);
         }
      } catch (err) {
         setError("Impossible de charger les pizzas");
      } finally {
         setLoading(false);
      }
   };

   const incrementer = (id) => {
      setQuantites((prev) => ({ ...prev, [id]: prev[id] + 1 }));
   };

   const decrementer = (id) => {
      setQuantites((prev) => ({ ...prev, [id]: Math.max(0, prev[id] - 1) }));
   };

   const pizzasPanier = pizzas.filter((p) => quantites[p.id_pizza] > 0);

   const totalPizzas = pizzasPanier.reduce(
      (sum, p) => sum + quantites[p.id_pizza],
      0,
   );

   const montantBrut = pizzasPanier.reduce(
      (total, p) => total + Number(p.prix) * quantites[p.id_pizza],
      0,
   );

   // Calcul des remises
   const remiseFidelite = (nbCommandesClient + 1) % 3 === 0;
   const remiseVolume = totalPizzas >= 5;
   let tauxRemise = 0;
   if (remiseFidelite) tauxRemise += 0.1;
   if (remiseVolume) tauxRemise += 0.05;
   const montantRemise = montantBrut * tauxRemise;
   const montantFinal = montantBrut - montantRemise;

   const handleLogout = () => {
      logout();
      navigate("/login");
   };

   const handleSubmit = async () => {
      if (pizzasPanier.length === 0) return;
      setSubmitting(true);
      setError("");

      try {
         const decoded = jwtDecode(token);
         const idUser = decoded.id_user;

         const response = await fetch(API_URL + "/commandes", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               id_user: idUser,
               lignes: pizzasPanier.map((pizza) => ({
                  id_pizza: pizza.id_pizza,
                  quantite: quantites[pizza.id_pizza],
               })),
            }),
         });

         if (response.status === 401) {
            logout();
            navigate("/login");
            return;
         }
         if (!response.ok) throw new Error();

         navigate("/mes-commandes");
      } catch (err) {
         setError("Impossible de valider la commande, veuillez réessayer");
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <div className="min-h-screen bg-orange-50">
         <nav className="bg-orange-500 px-6 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
               <button
                  onClick={() => navigate("/mes-commandes")}
                  className="text-orange-100 hover:text-white text-sm transition"
               >
                  ‹ Retour
               </button>
               <span className="text-white font-bold text-xl tracking-tight">
                  CDAPizza
               </span>
            </div>
            <button
               onClick={handleLogout}
               className="text-orange-100 hover:text-white text-sm font-medium transition"
            >
               Déconnexion
            </button>
         </nav>

         <div className="max-w-4xl mx-auto px-4 py-8 pb-64">
            <div className="mb-6">
               <h1 className="text-2xl font-bold text-gray-800">
                  Nouvelle commande
               </h1>
               <p className="text-sm text-gray-400 mt-0.5">
                  Choisissez vos pizzas
               </p>
            </div>

            {/* Bandeaux remises disponibles */}
            <div className="flex flex-wrap gap-2 mb-6">
               <div
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
                     remiseFidelite
                        ? "bg-purple-100 text-purple-700 border-purple-200"
                        : "bg-gray-50 text-gray-400 border-gray-200"
                  }`}
               >
                  {remiseFidelite ? "✓" : "○"} −10% fidélité
                  {!remiseFidelite && (
                     <span className="ml-1 text-gray-400">
                        ({3 - ((nbCommandesClient + 1) % 3)} cmd restante
                        {3 - ((nbCommandesClient + 1) % 3) > 1 ? "s" : ""})
                     </span>
                  )}
               </div>
               <div
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
                     remiseVolume
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-gray-50 text-gray-400 border-gray-200"
                  }`}
               >
                  {remiseVolume ? "✓" : "○"} −5% volume
                  {!remiseVolume && (
                     <span className="ml-1 text-gray-400">
                        ({5 - totalPizzas} pizza{5 - totalPizzas > 1 ? "s" : ""}{" "}
                        restante{5 - totalPizzas > 1 ? "s" : ""})
                     </span>
                  )}
               </div>
            </div>

            {error && (
               <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
               </div>
            )}

            {loading && (
               <div className="flex justify-center items-center py-20">
                  <div className="w-8 h-8 border-4 border-orange-300 border-t-orange-500 rounded-full animate-spin"></div>
               </div>
            )}

            {!loading && !error && pizzas.length === 0 && (
               <div className="text-center py-20 text-gray-400">
                  <div className="text-5xl mb-4">🍕</div>
                  <p className="text-lg font-medium">Aucune pizza disponible</p>
               </div>
            )}

            {!loading && pizzas.length > 0 && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pizzas.map((pizza) => (
                     <div
                        key={pizza.id_pizza}
                        className={`bg-white border rounded-xl shadow-sm overflow-hidden transition
                  ${
                     quantites[pizza.id_pizza] > 0
                        ? "border-orange-300"
                        : "border-gray-100"
                  }`}
                     >
                        <div className="h-2 bg-orange-400" />
                        <div className="px-5 py-4 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-xl">
                                 🍕
                              </div>
                              <div>
                                 <p className="text-gray-800 font-semibold text-sm">
                                    {pizza.nom}
                                 </p>
                                 <p className="text-orange-500 font-bold text-sm mt-0.5">
                                    {Number(pizza.prix).toFixed(2)} €
                                 </p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <button
                                 onClick={() => decrementer(pizza.id_pizza)}
                                 disabled={quantites[pizza.id_pizza] === 0}
                                 className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-lg flex items-center justify-center hover:bg-orange-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                              >
                                 −
                              </button>
                              <span className="w-5 text-center text-gray-800 font-semibold text-sm">
                                 {quantites[pizza.id_pizza]}
                              </span>
                              <button
                                 onClick={() => incrementer(pizza.id_pizza)}
                                 className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-lg flex items-center justify-center hover:bg-orange-600 transition"
                              >
                                 +
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* Panier fixe en bas */}
         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl px-4 py-4">
            <div className="max-w-4xl mx-auto">
               <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-700">
                     🛒 Panier{" "}
                     {pizzasPanier.length === 0 && (
                        <span className="text-gray-400 font-normal">
                           — vide
                        </span>
                     )}
                  </h2>
                  <div className="flex items-center gap-2">
                     {tauxRemise > 0 && (
                        <span className="text-xs text-gray-400 line-through">
                           {montantBrut.toFixed(2)} €
                        </span>
                     )}
                     <span
                        className={`font-bold text-sm ${tauxRemise > 0 ? "text-green-600" : "text-orange-500"}`}
                     >
                        {montantFinal.toFixed(2)} €
                     </span>
                  </div>
               </div>

               {/* Badges remises actives */}
               {tauxRemise > 0 && (
                  <div className="flex gap-2 mb-3">
                     {remiseFidelite && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                           −10% fidélité
                        </span>
                     )}
                     {remiseVolume && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                           −5% volume
                        </span>
                     )}
                     <span className="text-xs text-gray-400">
                        Économie : {montantRemise.toFixed(2)} €
                     </span>
                  </div>
               )}

               {pizzasPanier.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                     {pizzasPanier.map((pizza) => (
                        <div
                           key={pizza.id_pizza}
                           className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-lg px-3 py-1.5"
                        >
                           <span className="text-sm">🍕</span>
                           <span className="text-sm text-gray-700 font-medium">
                              {pizza.nom}
                           </span>
                           <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">
                              x{quantites[pizza.id_pizza]}
                           </span>
                           <span className="text-xs text-gray-400">
                              {(
                                 Number(pizza.prix) * quantites[pizza.id_pizza]
                              ).toFixed(2)}{" "}
                              €
                           </span>
                        </div>
                     ))}
                  </div>
               )}

               <button
                  disabled={pizzasPanier.length === 0 || submitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition text-sm"
                  onClick={handleSubmit}
               >
                  {submitting
                     ? "Envoi en cours..."
                     : pizzasPanier.length === 0
                       ? "Ajoutez des pizzas pour commander"
                       : `Valider la commande — ${montantFinal.toFixed(2)} €`}
               </button>
            </div>
         </div>
      </div>
   );
}
