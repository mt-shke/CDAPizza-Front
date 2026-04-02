import EtatBadge, { ETAT_LABELS } from "./EtatBadge";
import RemiseBadge, { getRemises } from "./RemiseBadge";
import PizzaLigne from "./PizzaLigne";

const ETAT_SUIVANT = {
  PAYER:       "PREPARATION",
  PREPARATION: "PRETE",
  PRETE:       "LIVRER",
  LIVRER:      null,
};

export default function CommandeCard({
  commande,
  lignes,
  pizzas,
  client,
  numeroCommande,
  isSelected,
  onCardClick,
  onChangerEtat,
  updating,
}) {
  const remises = getRemises(lignes, numeroCommande);
  const isLivree = commande.etat === "LIVRER";

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden transition
      ${isLivree ? "bg-green-100 border-green-400" : "bg-white border-gray-100"}`}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-orange-50 transition"
        onClick={() => onCardClick(commande.id_commande)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
            ${isLivree ? "bg-green-400 text-white" : "bg-orange-100 text-orange-500"}`}
          >
            #{commande.id_commande}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-gray-800 font-medium text-sm">
                Commande n°{commande.id_commande}
              </p>
              {remises.map((r, i) => (
                <RemiseBadge key={i} remise={r} />
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-0.5">
              👤 {client ? client.username : `Client #${commande.id_user}`}
              {" · "}
              {commande.date
                ? new Date(commande.date).toLocaleString("fr-FR", {
                    day: "2-digit", month: "2-digit", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })
                : "Date inconnue"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-gray-800 font-semibold text-sm">
            {commande.montant != null
              ? Number(commande.montant).toFixed(2) + " €"
              : "—"}
          </span>
          <EtatBadge etat={commande.etat} />
          <span className={`text-gray-400 text-lg transition-transform duration-200 ${isSelected ? "rotate-90" : ""}`}>
            ›
          </span>
        </div>
      </div>

      {/* Pizzas — toujours visibles */}
      {lignes?.length > 0 && (
        <div className={`border-t px-6 py-3
          ${isLivree ? "border-green-300 bg-green-100" : "border-gray-100 bg-orange-50"}`}
        >
          <div className="flex flex-wrap gap-2">
            {lignes.map((ligne) => (
              <PizzaLigne
                key={`${ligne.id?.idCommande}-${ligne.id?.idPizza}`}
                ligne={ligne}
                pizza={pizzas[ligne.id?.idPizza]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bouton changement état */}
      {isSelected && (
        <div className={`border-t px-6 py-4
          ${isLivree ? "border-green-300 bg-green-50" : "border-gray-100 bg-white"}`}
        >
          {ETAT_SUIVANT[commande.etat] ? (
            <button
              onClick={() => onChangerEtat(commande)}
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
}
