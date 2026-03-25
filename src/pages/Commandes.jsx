import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { jwtDecode } from "jwt-decode";

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

const ETAT_SUIVANT = {
   PAYER: "PREPARATION",
   PREPARATION: "PRETE",
   PRETE: "LIVRER",
   LIVRER: null,
};

const getRemises = (commande, lignes, numeroCommande) => {
   const remises = [];

   // Remise 10% si c'est la 3ème, 6ème, 9ème commande du client
   if (numeroCommande && numeroCommande % 3 === 0) {
      remises.push({
         label: "−10% fidélité",
         color: "bg-purple-100 text-purple-700 border border-purple-200",
      });
   }

   // Remise 5% si plus de 5 pizzas
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

export default function Commandes() {
   const [commandes, setCommandes] = useState([]);
   const [lignes, setLignes] = useState({});
   const [pizzas, setPizzas] = useState({});
   const [users, setUsers] = useState({});
   const [numeroCommandeParUser, setNumeroCommandeParUser] = useState({});
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [selectedId, setSelectedId] = useState(null);
   const [updating, setUpdating] = useState(false);
   const { token, logout } = useAuth();
   const navigate = useNavigate();

   useEffect(() => {
      fetchAll();
   }, []);

   const fetchAll = async () => {
      try {
         // Commandes
         const resCommandes = await fetch(API_URL + "/commandes", {
            headers: { Authorization: `Bearer ${token}` },
         });
         if (resCommandes.status === 401) {
            logout();
            navigate("/login");
            return;
         }
         if (!resCommandes.ok) throw new Error();
         const allCommandes = await resCommandes.json();
         setCommandes(allCommandes);

         // Calcul du numéro chronologique de chaque commande par client
         const numeroCmd = {};
         const compteurParUser = {};
         [...allCommandes]
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .forEach((c) => {
               compteurParUser[c.id_user] =
                  (compteurParUser[c.id_user] || 0) + 1;
               numeroCmd[c.id_commande] = compteurParUser[c.id_user];
            });
         setNumeroCommandeParUser(numeroCmd);

         // Pizzas
         const resPizzas = await fetch(API_URL + "/pizzas", {
            headers: { Authorization: `Bearer ${token}` },
         });
         if (!resPizzas.ok) throw new Error();
         const allPizzas = await resPizzas.json();
         const pizzaMap = {};
         allPizzas.forEach((p) => {
            pizzaMap[p.id_pizza] = p;
         });
         setPizzas(pizzaMap);

         // Users
         const resUsers = await fetch(API_URL + "/users", {
            headers: { Authorization: `Bearer ${token}` },
         });
         if (resUsers.ok) {
            const allUsers = await resUsers.json();
            const userMap = {};
            allUsers.forEach((u) => {
               userMap[u.id] = u;
            });
            setUsers(userMap);
         }

         // Lignes de commande
         const lignesMap = {};
         await Promise.all(
            allCommandes.map(async (c) => {
               const resLignes = await fetch(
                  API_URL + `/contenir/commande/${c.id_commande}`,
                  { headers: { Authorization: `Bearer ${token}` } },
               );
               if (resLignes.ok) {
                  lignesMap[c.id_commande] = await resLignes.json();
               } else {
                  lignesMap[c.id_commande] = [];
               }
            }),
         );
         setLignes(lignesMap);
      } catch (err) {
         setError("Impossible de charger les commandes");
      } finally {
         setLoading(false);
      }
   };

   const handleCardClick = (id) => {
      setSelectedId(selectedId === id ? null : id);
   };

   const handleChangerEtat = async (commande) => {
      const nouvelEtat = ETAT_SUIVANT[commande.etat];
      if (!nouvelEtat) return;
      setUpdating(true);
      try {
         const response = await fetch(
            API_URL + `/commandes/${commande.id_commande}`,
            {
               method: "PUT",
               headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify({
                  date: commande.date,
                  montant: commande.montant,
                  etat: nouvelEtat,
                  id_user: commande.id_user,
               }),
            },
         );
         if (!response.ok) throw new Error();
         setCommandes((prev) =>
            prev.map((c) =>
               c.id_commande === commande.id_commande
                  ? { ...c, etat: nouvelEtat }
                  : c,
            ),
         );
         setSelectedId(null);
      } catch (err) {
         setError("Impossible de modifier le statut");
      } finally {
         setUpdating(false);
      }
   };

   const handleLogout = () => {
      logout();
      navigate("/login");
   };

   const role = token ? jwtDecode(token).role : null;

   useEffect(() => {
      fetchAll();

      // Rafraîchissement toutes les 10 secondes
      const interval = setInterval(() => {
         fetchAll();
      }, 10000);

      // Nettoyage à la destruction du composant
      return () => clearInterval(interval);
   }, []);

   return (
      <div className="min-h-screen bg-orange-50">
         <nav className="bg-orange-500 px-6 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
               <span className="text-2xl">🍕</span>
               <span className="text-white font-bold text-xl tracking-tight">
                  CDAPizza
               </span>
            </div>
            <div className="flex items-center gap-4">
               {role === "cuisine" && (
                  <button
                     onClick={() => navigate("/gestion-pizzas")}
                     className="text-orange-100 hover:text-white text-sm font-medium transition"
                  >
                     Gérer les pizzas
                  </button>
               )}
               <button
                  onClick={handleLogout}
                  className="text-orange-100 hover:text-white text-sm font-medium transition"
               >
                  Déconnexion
               </button>
            </div>
         </nav>

         <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-6">
               <h1 className="text-2xl font-bold text-gray-800">Commandes</h1>
               <p className="text-sm text-gray-400 mt-0.5">
                  {commandes.length} commande{commandes.length > 1 ? "s" : ""}{" "}
                  au total
               </p>
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
                           commande,
                           lignes[commande.id_commande],
                           numeroCommandeParUser[commande.id_commande],
                        );
                        const client = users[commande.id_user];

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
                              {/* Header */}
                              <div
                                 className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-orange-50 transition"
                                 onClick={() =>
                                    handleCardClick(commande.id_commande)
                                 }
                              >
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
                                       <p className="text-gray-500 text-xs mt-0.5">
                                          👤{" "}
                                          {client
                                             ? client.username
                                             : `Client #${commande.id_user}`}
                                          {" · "}
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
                                    <span
                                       className={`text-gray-400 text-lg transition-transform duration-200 ${selectedId === commande.id_commande ? "rotate-90" : ""}`}
                                    >
                                       ›
                                    </span>
                                 </div>
                              </div>

                              {/* Pizzas — toujours visibles */}
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

                              {/* Bouton changement état */}
                              {selectedId === commande.id_commande && (
                                 <div
                                    className={`border-t px-6 py-4
                        ${
                           commande.etat === "LIVRER"
                              ? "border-green-300 bg-green-50"
                              : "border-gray-100 bg-white"
                        }`}
                                 >
                                    {ETAT_SUIVANT[commande.etat] ? (
                                       <button
                                          onClick={() =>
                                             handleChangerEtat(commande)
                                          }
                                          disabled={updating}
                                          className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
                                       >
                                          {updating
                                             ? "Mise à jour..."
                                             : `Passer à : ${ETAT_LABELS[ETAT_SUIVANT[commande.etat]]}`}
                                       </button>
                                    ) : (
                                       <p className="text-sm text-green-600 font-medium">
                                          ✅ Commande terminée
                                       </p>
                                    )}
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
