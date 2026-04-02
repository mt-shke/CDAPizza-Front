export default function PizzaLigne({ ligne, pizza }) {
  return (
    <div className="flex items-center gap-2 bg-white border border-orange-100 rounded-lg px-3 py-1.5">
      <span className="text-sm">🍕</span>
      <span className="text-sm text-gray-700 font-medium">
        {pizza ? pizza.nom : `Pizza #${ligne.id?.idPizza}`}
      </span>
      <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">
        x{ligne.quantite}
      </span>
    </div>
  );
}
