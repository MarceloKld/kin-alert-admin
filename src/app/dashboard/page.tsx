export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
                <p className="text-slate-500">Aperçu global de l'activité de KIN ALERT.</p>
            </div>

            {/* Grid de Stats - On prépare le terrain pour l'API */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Incidents en attente", value: "12", color: "text-orange-600" },
                    { label: "Validés aujourd'hui", value: "45", color: "text-green-600" },
                    { label: "Total Citoyens", value: "1,200", color: "text-blue-600" },
                    { label: "Alertes critiques", value: "3", color: "text-red-600" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}