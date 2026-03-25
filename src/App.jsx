import { Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute, RoleRoute } from "./components/Routes";
import Login from "./pages/Login";
import Commandes from "./pages/Commandes";
import MesCommandes from "./pages/MesCommandes";
import NouvelleCommande from "./pages/NouvelleCommande";
import Unauthorized from "./pages/Unauthorized";
import Register from "./pages/Register";
import GestionPizzas from "./pages/GestionPizzas";

function App() {
   return (
      <Routes>
         {/* Public */}

         <Route path="/register" element={<Register />} />
         <Route path="/login" element={<Login />} />
         <Route path="/unauthorized" element={<Unauthorized />} />
         <Route path="/" element={<Navigate to="/login" />} />

         {/* Client → ses commandes uniquement */}
         <Route
            path="/mes-commandes"
            element={
               <PrivateRoute>
                  <RoleRoute roles={["client"]}>
                     <MesCommandes />
                  </RoleRoute>
               </PrivateRoute>
            }
         />

         {/* Client → nouvelle commande */}
         <Route
            path="/commandes/nouvelle"
            element={
               <PrivateRoute>
                  <RoleRoute roles={["client"]}>
                     <NouvelleCommande />
                  </RoleRoute>
               </PrivateRoute>
            }
         />

         {/* Caisse + Cuisine → toutes les commandes */}
         <Route
            path="/commandes"
            element={
               <PrivateRoute>
                  <RoleRoute roles={["caisse", "cuisine"]}>
                     <Commandes />
                  </RoleRoute>
               </PrivateRoute>
            }
         />

         {/* Cuisine uniquement */}
         <Route
            path="/gestion-pizzas"
            element={
               <PrivateRoute>
                  <RoleRoute roles={["cuisine"]}>
                     <GestionPizzas />
                  </RoleRoute>
               </PrivateRoute>
            }
         />

         <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
   );
}

export default App;
