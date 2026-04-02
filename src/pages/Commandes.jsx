import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { jwtDecode } from "jwt-decode";
import CommandeCard from "../components/CommandeCard";

const ETAT_ORDER = {
   PAYER: 1,
   PREPARATION: 2,
   PRETE: 3,
   LIVRER: 4,
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
   const role = token ? jwtDecode(token).role : null;

   useEffect(() => {
      fetchAll();
      const interval = setInterval(fetchAll, 5000);
      return () => clearInterval(interval);
   }, []);

   const fetchAll = async () => {
      try {
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

         const lignesMap = {};
         await Promise.all(
            allCommandes.map(async (c) => {
               const resLignes = await fetch(
                  API_URL + `/contenir/commande/${c.id_commande}`,
                  { headers: { Authorization: `Bearer ${token}` } },
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

   const handleCardClick = (id) => {
      setSelectedId(selectedId === id ? null : id);
   };

   const handleChangerEtat = async (commande) => {
      const ETAT_SUIVANT = {
         PAYER: "PREPARATION",
         PREPARATION: "PRETE",
         PRETE: "LIVRER",
         LIVRER: null,
      };
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
                     .map((commande) => (
                        <CommandeCard
                           key={commande.id_commande}
                           commande={commande}
                           lignes={lignes[commande.id_commande]}
                           pizzas={pizzas}
                           client={users[commande.id_user]}
                           numeroCommande={
                              numeroCommandeParUser[commande.id_commande]
                           }
                           isSelected={selectedId === commande.id_commande}
                           onCardClick={handleCardClick}
                           onChangerEtat={handleChangerEtat}
                           updating={updating}
                        />
                     ))}
               </div>
            )}
         </div>
      </div>
   );
}
