import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

export default function GestionPizzas() {
   const [pizzas, setPizzas] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [nom, setNom] = useState("");
   const [prix, setPrix] = useState("");
   const [submitting, setSubmitting] = useState(false);
   const [deletingId, setDeletingId] = useState(null);
   const [editingId, setEditingId] = useState(null);
   const [editNom, setEditNom] = useState("");
   const [editPrix, setEditPrix] = useState("");
   const [saving, setSaving] = useState(false);
   const { token, logout } = useAuth();
   const navigate = useNavigate();

   useEffect(() => {
      fetchPizzas();
   }, []);

   const fetchPizzas = async () => {
      try {
         const response = await fetch(`${API_URL}/pizzas`, {
            headers: { Authorization: `Bearer ${token}` },
         });
         if (response.status === 401) {
            logout();
            navigate("/login");
            return;
         }
         if (!response.ok) throw new Error();
         const data = await response.json();
         setPizzas(data);
      } catch (err) {
         setError("Impossible de charger les pizzas");
      } finally {
         setLoading(false);
      }
   };

   const handleAjouter = async (e) => {
      e.preventDefault();
      if (!nom.trim() || !prix) return;
      setSubmitting(true);
      setError("");
      try {
         const response = await fetch(`${API_URL}/pizzas`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ nom: nom.trim(), prix: parseFloat(prix) }),
         });
         if (response.status === 409) {
            setError("Une pizza avec ce nom existe déjà");
            return;
         }
         if (!response.ok) throw new Error();
         const nouvelle = await response.json();
         setPizzas((prev) => [...prev, nouvelle]);
         setNom("");
         setPrix("");
      } catch (err) {
         setError("Impossible d'ajouter la pizza");
      } finally {
         setSubmitting(false);
      }
   };

   const handleSupprimer = async (id) => {
      setDeletingId(id);
      setError("");
      try {
         const response = await fetch(`${API_URL}/pizzas/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
         });
         if (!response.ok) throw new Error();
         setPizzas((prev) => prev.filter((p) => p.id_pizza !== id));
         if (editingId === id) setEditingId(null);
      } catch (err) {
         setError(
            "Impossible de supprimer la pizza — elle est peut-être liée à des commandes",
         );
      } finally {
         setDeletingId(null);
      }
   };

   const handleClickPizza = (pizza) => {
      if (editingId === pizza.id_pizza) {
         setEditingId(null);
         return;
      }
      setEditingId(pizza.id_pizza);
      setEditNom(pizza.nom);
      setEditPrix(pizza.prix);
      setError("");
   };

   const handleSauvegarder = async (pizza) => {
      if (!editNom.trim() || !editPrix) return;
      setSaving(true);
      setError("");
      try {
         const response = await fetch(`${API_URL}/pizzas/${pizza.id_pizza}`, {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               nom: editNom.trim(),
               prix: parseFloat(editPrix),
            }),
         });
         if (response.status === 409) {
            setError("Une pizza avec ce nom existe déjà");
            return;
         }
         if (!response.ok) throw new Error();
         const updated = await response.json();
         setPizzas((prev) =>
            prev.map((p) => (p.id_pizza === pizza.id_pizza ? updated : p)),
         );
         setEditingId(null);
      } catch (err) {
         setError("Impossible de modifier la pizza");
      } finally {
         setSaving(false);
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
               <button
                  onClick={() => navigate("/commandes")}
                  className="text-orange-100 hover:text-white text-sm transition"
               >
                  ‹ Retour
               </button>
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

         <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="mb-6">
               <h1 className="text-2xl font-bold text-gray-800">
                  Gestion des pizzas
               </h1>
               <p className="text-sm text-gray-400 mt-0.5">
                  {pizzas.length} pizza{pizzas.length > 1 ? "s" : ""} au
                  catalogue · Cliquez sur une pizza pour la modifier
               </p>
            </div>

            {error && (
               <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
               </div>
            )}

            {/* Formulaire ajout */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-5 mb-6">
               <h2 className="text-sm font-semibold text-gray-700 mb-4">
                  Ajouter une pizza
               </h2>
               <form onSubmit={handleAjouter} className="flex gap-3 items-end">
                  <div className="flex-1">
                     <label className="block text-xs font-medium text-gray-600 mb-1">
                        Nom
                     </label>
                     <input
                        type="text"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        required
                        placeholder="ex: Calzone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                     />
                  </div>
                  <div className="w-28">
                     <label className="block text-xs font-medium text-gray-600 mb-1">
                        Prix (€)
                     </label>
                     <input
                        type="number"
                        value={prix}
                        onChange={(e) => setPrix(e.target.value)}
                        required
                        min="0.01"
                        step="0.01"
                        placeholder="9.50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                     />
                  </div>
                  <button
                     type="submit"
                     disabled={submitting}
                     className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                  >
                     {submitting ? "..." : "+ Ajouter"}
                  </button>
               </form>
            </div>

            {/* Liste pizzas */}
            {loading && (
               <div className="flex justify-center items-center py-20">
                  <div className="w-8 h-8 border-4 border-orange-300 border-t-orange-500 rounded-full animate-spin"></div>
               </div>
            )}

            {!loading && pizzas.length === 0 && (
               <div className="text-center py-20 text-gray-400">
                  <div className="text-5xl mb-4">🍕</div>
                  <p className="text-lg font-medium">
                     Aucune pizza au catalogue
                  </p>
               </div>
            )}

            {!loading && pizzas.length > 0 && (
               <div className="space-y-3">
                  {pizzas.map((pizza) => (
                     <div
                        key={pizza.id_pizza}
                        className={`bg-white rounded-xl shadow-sm border overflow-hidden transition
                  ${
                     editingId === pizza.id_pizza
                        ? "border-orange-300"
                        : "border-gray-100 cursor-pointer hover:border-orange-200 hover:shadow-md"
                  }`}
                     >
                        {/* Ligne principale — clic pour éditer */}
                        <div
                           className="px-6 py-4 flex items-center justify-between"
                           onClick={() => handleClickPizza(pizza)}
                        >
                           <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-lg">
                                 🍕
                              </div>
                              <div>
                                 <p className="text-gray-800 font-medium text-sm">
                                    {pizza.nom}
                                 </p>
                                 <p className="text-orange-500 font-bold text-sm">
                                    {Number(pizza.prix).toFixed(2)} €
                                 </p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400">
                                 {editingId === pizza.id_pizza
                                    ? "Fermer ✕"
                                    : "Modifier ✎"}
                              </span>
                              <button
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    handleSupprimer(pizza.id_pizza);
                                 }}
                                 disabled={deletingId === pizza.id_pizza}
                                 className="text-red-400 hover:text-red-600 disabled:opacity-30 text-sm font-medium transition"
                              >
                                 {deletingId === pizza.id_pizza
                                    ? "..."
                                    : "Supprimer"}
                              </button>
                           </div>
                        </div>

                        {/* Formulaire édition inline */}
                        {editingId === pizza.id_pizza && (
                           <div className="border-t border-orange-100 bg-orange-50 px-6 py-4">
                              <div className="flex gap-3 items-end">
                                 <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                       Nom
                                    </label>
                                    <input
                                       type="text"
                                       value={editNom}
                                       onChange={(e) =>
                                          setEditNom(e.target.value)
                                       }
                                       onClick={(e) => e.stopPropagation()}
                                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                                    />
                                 </div>
                                 <div className="w-28">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                       Prix (€)
                                    </label>
                                    <input
                                       type="number"
                                       value={editPrix}
                                       onChange={(e) =>
                                          setEditPrix(e.target.value)
                                       }
                                       onClick={(e) => e.stopPropagation()}
                                       min="0.01"
                                       step="0.01"
                                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                                    />
                                 </div>
                                 <button
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       handleSauvegarder(pizza);
                                    }}
                                    disabled={saving}
                                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                                 >
                                    {saving ? "..." : "Sauvegarder"}
                                 </button>
                              </div>
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
