"use client";

import { useEffect, useState } from "react";
import { Users, AlertCircle, CheckCircle, MapPin, BarChart3, ShieldAlert, TrendingUp } from "lucide-react";
import { DashboardService } from "@/services/dashboard.service";
import { DashboardData } from "@/types";
import { DashboardSkeleton } from "@/components/features/DashboardSkeleton";
// Au lieu de @/components/features/IncidentChart
import { IncidentChart } from "../../components/features/IncidentChart";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        DashboardService.getStats()
            .then(setData)
            .finally(() => setTimeout(() => setLoading(false), 1200));
    }, []);

    if (loading) return <DashboardSkeleton />;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-4 md:p-8 space-y-8"
        >
            {/* 1.5 LIVE TICKER (Défilement des types d'incidents) */}
            <div className="bg-slate-900 text-white py-3 overflow-hidden border-y border-slate-800">
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: "-100%" }}
                    transition={{
                        repeat: Infinity,
                        duration: 25, // Vitesse du défilement
                        ease: "linear"
                    }}
                    className="flex whitespace-nowrap gap-12 items-center"
                >
                    {[
                        "⚠️ URGENCE : DANGER IMMÉDIAT",
                        "Embouteillage critique",
                        "Panne d'électricité",
                        "Érosion / Ravin",
                        "Tas d'immondices",
                        "Tuyau de la REGIDESO cassé",
                        "Feu de signalisation en panne",
                        "Éclairage public défectueux",
                        "Nuisance sonore",
                        "Autres signalements..."
                    ].map((titre, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                            <span className="text-sm font-bold uppercase tracking-wider">{titre}</span>
                        </div>
                    ))}
                </motion.div>
            </div>


            {/* 1. HEADER */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">KIN-ALERT Live</h1>
                    <p className="text-slate-500">Données en temps réel de la ville</p>
                </div>
                <div className="hidden md:flex bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-2xl items-center gap-2 border border-emerald-500/20">
                    <TrendingUp size={18} />
                    <span className="font-semibold">{"+24% d'activité"}</span>
                </div>
            </div>

            {/* 2. STATS CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Incidents" value={data?.stats.incidents_total} icon={<AlertCircle className="text-amber-500" />} color="border-amber-500/20" />
                <StatCard title="En Attente" value={data?.stats.incidents_pending} icon={<ShieldAlert className="text-red-500" />} color="border-red-500/20" />
                <StatCard title="Validés" value={data?.stats.incidents_validated} icon={<CheckCircle className="text-emerald-500" />} color="border-emerald-500/20" />

                {/* Nouvelle Carte : Gestionnaires */}
                <StatCard title="Gestionnaires" value={data?.stats.gestionnaires_total} icon={<Users className="text-indigo-500" />} color="border-indigo-500/20" />

                {/* Nouvelle Carte : Rejetés */}
                <StatCard title="Rejetés" value={data?.stats.incidents_rejected} icon={<AlertCircle className="text-rose-500" />} color="border-rose-500/20" />

                {/* Nouvelle Carte : Supprimés */}
                <StatCard title="Supprimés" value={data?.stats.incidents_deleted} icon={<BarChart3 className="text-slate-500" />} color="border-slate-500/20" />

                <StatCard title="Citoyens" value={data?.stats.users_total} icon={<Users className="text-blue-500" />} color="border-blue-500/20" />
            </div>

            {/* 3. GRAPHIQUE PRINCIPAL */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Évolution des Incidents</h3>
                    <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm p-2 outline-none">
                        <option>6 derniers mois</option>
                    </select>
                </div>
                <IncidentChart data={data?.charts.incidents_by_month ?? []} />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 4. TOP COMMUNES */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-2"><MapPin className="text-red-500" /> Communes les plus actives</h3>
                    <div className="space-y-6">
                        {(data?.charts.top_communes ?? []).map((commune: { nom: string, total: number }, index: number) => (
                            <div key={index} className="group">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-semibold group-hover:text-red-500 transition-colors">{commune.nom}</span>
                                    <span className="text-slate-500 font-mono">{commune.total}</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(commune.total / (data?.charts.top_communes[0]?.total || 1)) * 100}%` }}
                                        transition={{ duration: 1, ease: "circOut" }}
                                        className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 5. RÉPARTITION PAR TYPE */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-2"><BarChart3 className="text-blue-500" /> Nature des Incidents</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {(data?.charts.incidents_by_type ?? []).slice(0, 6).map((type: { titre: string, total: number }, index: number) => (
                            <div key={index} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-transform">
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">{type.titre}</p>
                                <p className="text-2xl font-black">{type.total}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

// COMPOSANT INTERNE (Toujours après la fonction principale ou dans un autre fichier)
interface StatCardProps {
    title: string;
    value?: number;
    icon: React.ReactNode;
    color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
    return (
        <motion.div
            variants={itemVariants}
            className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border ${color} flex items-center justify-between shadow-sm`}
        >
            <div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold mt-1 dark:text-white">{value ?? 0}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">{icon}</div>
        </motion.div>
    );
}