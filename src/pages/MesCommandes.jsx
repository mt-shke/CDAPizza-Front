import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const ETAT_STYLES = {
   PAYER: "bg-yellow-100 text-yellow-700 border border-yellow-200",
   PREPARATION: "bg-blue-100 text-blue-700 border border-blue-200",
   PRETE: "bg-green-100 text-green-700 border border-green-200",
   LIVRER: "bg-green-400 text-white border border-green-500",
};

const ETAT_LABELS = {
   PAYER: "💳 À payer",
   PREPARATION: "👨‍🍳 En préparation",
   PRETE: "✅ Prête",
   LIVRER: "🛵 Livrée",
};

const ETAT_ORDER = {
   PAYER: 1,
   PREPARATION: 2,
   PRETE: 3,
   LIVRER: 4,
};

const getRemises = (lignes, numeroCommande) => {
   const remises = [];

   if (numeroCommande && numeroCommande % 3 === 0) {
      remises.push({
         label: "−10% fidélité",
         color: "bg-purple-100 text-purple-700 border border-purple-200",
      });
   }

   const totalPizzas = (lignes || []).reduce(
      (sum, l) => sum + (l.quantite || 0),
      0,
   );
   if (totalPizzas >= 5) {
      remises.push({
         label: "−5% volume",
         color: "bg-blue-100 text-blue-700 border border-blue-200",
      });
   }

   return remises;
};

export default function MesCommandes() {
   const [commandes, setCommandes] = useState([]);
   const [lignes, setLignes] = useState({});
   const [pizzas, setPizzas] = useState({});
   const [numeroCommandeParId, setNumeroCommandeParId] = useState({});
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   const { logout, getIdUser } = useAuth();
   const navigate = useNavigate();

   useEffect(() => {
      fetchAll();
   }, []);

   const fetchAll = async () => {
      try {
         const idUser = getIdUser();

         if (!idUser) {
            logout();
            navigate("/login");
            return;
         }

         // Commandes
         const resCommandes = await fetch(API_URL + "/commandes", {
            credentials: "include",
         });
         if (resCommandes.status === 401) {
            logout();
            navigate("/login");
            return;
         }
         if (!resCommandes.ok) throw new Error();
         const allCommandes = await resCommandes.json();
         const mesCommandes = allCommandes.filter((c) => c.id_user === idUser);
         setCommandes(mesCommandes);
         console.log(getIdUser);

         // Calcul du numéro chronologique de chaque commande du client
         const numeroCmd = {};
         [...mesCommandes]
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .forEach((c, index) => {
               numeroCmd[c.id_commande] = index + 1;
            });
         setNumeroCommandeParId(numeroCmd);

         // Pizzas
         const resPizzas = await fetch(API_URL + "/pizzas", {
            credentials: "include",
         });
         if (!resPizzas.ok) throw new Error();
         const allPizzas = await resPizzas.json();
         const pizzaMap = {};
         allPizzas.forEach((p) => {
            pizzaMap[p.id_pizza] = p;
         });
         setPizzas(pizzaMap);

         // Lignes de commande
         const lignesMap = {};
         await Promise.all(
            mesCommandes.map(async (c) => {
               const resLignes = await fetch(
                  API_URL + `/contenir/commande/${c.id_commande}`,
                  { credentials: "include" },
               );
               lignesMap[c.id_commande] = resLignes.ok
                  ? await resLignes.json()
                  : [];
            }),
         );
         setLignes(lignesMap);
      } catch (err) {
         setError("Impossible de charger les commandes");
      } finally {
         setLoading(false);
      }
   };

   const handleLogout = () => {
      logout();
      navigate("/login");
   };

   return (
      <div className="min-h-screen bg-orange-50">
         <nav className="bg-orange-500 px-6 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
               <span className="text-2xl">🍕</span>
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

         <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
               <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                     Mes commandes
                  </h1>
                  <p className="text-sm text-gray-400 mt-0.5">
                     {commandes.length} commande
                     {commandes.length > 1 ? "s" : ""} au total
                  </p>
               </div>
               <button
                  onClick={() => navigate("/commandes/nouvelle")}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
               >
                  + Nouvelle commande
               </button>
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

            {!loading && !error && commandes.length === 0 && (
               <div className="text-center py-20 text-gray-400">
                  <div className="text-5xl mb-4">🍕</div>
                  <p className="text-lg font-medium">
                     Aucune commande pour le moment
                  </p>
               </div>
            )}

            {!loading && commandes.length > 0 && (
               <div className="space-y-4">
                  {[...commandes]
                     .sort(
                        (a, b) =>
                           (ETAT_ORDER[a.etat] || 99) -
                           (ETAT_ORDER[b.etat] || 99),
                     )
                     .map((commande) => {
                        const remises = getRemises(
                           lignes[commande.id_commande],
                           numeroCommandeParId[commande.id_commande],
                        );

                        return (
                           <div
                              key={commande.id_commande}
                              className={`rounded-xl shadow-sm border overflow-hidden transition
                      ${
                         commande.etat === "LIVRER"
                            ? "bg-green-100 border-green-400"
                            : "bg-white border-gray-100"
                      }`}
                           >
                              <div className="px-6 py-4 flex items-center justify-between">
                                 <div className="flex items-center gap-4">
                                    <div
                                       className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                          ${
                             commande.etat === "LIVRER"
                                ? "bg-green-400 text-white"
                                : "bg-orange-100 text-orange-500"
                          }`}
                                    >
                                       #{commande.id_commande}
                                    </div>
                                    <div>
                                       <div className="flex items-center gap-2 flex-wrap">
                                          <p className="text-gray-800 font-medium text-sm">
                                             Commande n°{commande.id_commande}
                                          </p>
                                          {remises.map((r, i) => (
                                             <span
                                                key={i}
                                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.color}`}
                                             >
                                                {r.label}
                                             </span>
                                          ))}
                                       </div>
                                       <p className="text-gray-400 text-xs mt-0.5">
                                          {commande.date
                                             ? new Date(
                                                  commande.date,
                                               ).toLocaleString("fr-FR", {
                                                  day: "2-digit",
                                                  month: "2-digit",
                                                  year: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                               })
                                             : "Date inconnue"}
                                       </p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <span className="text-gray-800 font-semibold text-sm">
                                       {commande.montant != null
                                          ? Number(commande.montant).toFixed(
                                               2,
                                            ) + " €"
                                          : "—"}
                                    </span>
                                    <span
                                       className={`text-xs font-medium px-3 py-1 rounded-full ${ETAT_STYLES[commande.etat] || "bg-gray-100 text-gray-500"}`}
                                    >
                                       {ETAT_LABELS[commande.etat] ||
                                          commande.etat}
                                    </span>
                                 </div>
                              </div>

                              {lignes[commande.id_commande]?.length > 0 && (
                                 <div
                                    className={`border-t px-6 py-3
                        ${
                           commande.etat === "LIVRER"
                              ? "border-green-300 bg-green-100"
                              : "border-gray-100 bg-orange-50"
                        }`}
                                 >
                                    <div className="flex flex-wrap gap-2">
                                       {lignes[commande.id_commande].map(
                                          (ligne) => {
                                             const pizza =
                                                pizzas[ligne.id?.idPizza];
                                             return (
                                                <div
                                                   key={`${ligne.id?.idCommande}-${ligne.id?.idPizza}`}
                                                   className="flex items-center gap-2 bg-white border border-orange-100 rounded-lg px-3 py-1.5"
                                                >
                                                   <span className="text-sm">
                                                      🍕
                                                   </span>
                                                   <span className="text-sm text-gray-700 font-medium">
                                                      {pizza
                                                         ? pizza.nom
                                                         : `Pizza #${ligne.id?.idPizza}`}
                                                   </span>
                                                   <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">
                                                      x{ligne.quantite}
                                                   </span>
                                                </div>
                                             );
                                          },
                                       )}
                                    </div>
                                 </div>
                              )}
                           </div>
                        );
                     })}
               </div>
            )}
         </div>
      </div>
   );
}
