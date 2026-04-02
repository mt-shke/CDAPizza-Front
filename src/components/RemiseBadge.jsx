export const getRemises = (lignes, numeroCommande) => {
  const remises = [];

  if (numeroCommande && numeroCommande % 3 === 0) {
    remises.push({
      label: "−10% fidélité",
      color: "bg-purple-100 text-purple-700 border border-purple-200",
    });
  }

  const totalPizzas = (lignes || []).reduce((sum, l) => sum + (l.quantite || 0), 0);
  if (totalPizzas >= 5) {
    remises.push({
      label: "−5% volume",
      color: "bg-blue-100 text-blue-700 border border-blue-200",
    });
  }

  return remises;
};

export default function RemiseBadge({ remise }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${remise.color}`}>
      {remise.label}
    </span>
  );
}
