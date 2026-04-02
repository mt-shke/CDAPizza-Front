const ETAT_STYLES = {
  PAYER:       "bg-yellow-100 text-yellow-700 border border-yellow-200",
  PREPARATION: "bg-blue-100 text-blue-700 border border-blue-200",
  PRETE:       "bg-green-100 text-green-700 border border-green-200",
  LIVRER:      "bg-green-400 text-white border border-green-500",
};

export const ETAT_LABELS = {
  PAYER:       "💳 À payer",
  PREPARATION: "👨‍🍳 En préparation",
  PRETE:       "✅ Prête",
  LIVRER:      "🛵 Livrée",
};

export default function EtatBadge({ etat }) {
  return (
    <span className={`text-xs font-medium px-3 py-1 rounded-full ${ETAT_STYLES[etat] || "bg-gray-100 text-gray-500"}`}>
      {ETAT_LABELS[etat] || etat}
    </span>
  );
}
